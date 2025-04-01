import { Transaction } from '@solomonai/prisma';
import { type OpenAIProvider, createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

type EnrichedTransaction = {
  id: string;
  category_slug: string | null;
  name: string;
  confidence?: number;
  description?: string | null;
  is_recurring?: boolean | null;
  purpose?: string | null;
  anomaly_score?: number | null;
  tax_deductible?: boolean | null;
  vat_applicable?: boolean | null;
  suggested_vat_rate?: number | null;
  merchant_category?: string | null;
  merchant_website?: string | null;
  cash_flow_type?: 'fixed' | 'variable' | 'one-time' | null;
  business_purpose?: string | null;
  transaction_type?: string | null;
  is_business?: boolean | null;
  need_want_category?: 'need' | 'want' | 'investment' | null;
  frequency?: string | null;
  // Additional enrichment fields
  budget_impact?: 'high' | 'medium' | 'low' | null;
  forecast_future_occurrences?: Array<{ date: string; amount: number }> | null;
  spending_trend?: 'increasing' | 'decreasing' | 'stable' | null;
  merchant_risk_score?: number | null;
  suggested_tags?: string[] | null;
  expense_policy_compliance?: boolean | null;
  expense_policy_issues?: string[] | null;
  suggested_splits?: Array<{
    category: string;
    amount: number;
    percentage: number;
  }> | null;
  location_insights?: string | null;
  travel_purpose?: string | null;
  peer_comparison?: 'higher' | 'average' | 'lower' | null;
  financial_health_impact?: string | null;
  receipt_required?: boolean | null;
  foreign_transaction_analysis?: {
    exchange_rate?: number;
    original_currency?: string;
    currency_volatility?: 'high' | 'medium' | 'low';
  } | null;
  inflation_adjusted_amount?: number | null;
  similar_transactions_count?: number | null;
  merchant_reputation?:
  | 'excellent'
  | 'good'
  | 'average'
  | 'poor'
  | 'unknown'
  | null;
};

/** Service for enriching transaction data using AI */
export class EnrichmentService {
  model: OpenAIProvider;

  constructor() {
    this.model = createOpenAI({
      baseURL: process.env.AI_GATEWAY_ENDPOINT,
      apiKey: process.env.AI_GATEWAY_API_KEY,
    });
  }

  /**
   * Categorizes transactions using AI
   *
   * @param transactions - Array of transactions to categorize
   * @returns Enriched transactions with category_slug
   */
  async enrichTransactions(
    transactions: Transaction[]
  ): Promise<EnrichedTransaction[]> {
    const { object } = await generateObject({
      model: this.model.chat(process.env.AI_GATEWAY_MODEL!),
      prompt: `You are an expert in categorizing financial transactions for business expense tracking.
            Analyze the transaction details and determine the most appropriate category.

            Here are the categories and their descriptions:
            - travel: Business travel expenses including flights, hotels, car rentals, and other transportation costs
            - office_supplies: Office materials like paper, pens, printer supplies, and basic office equipment
            - meals: Business meals, client dinners, team lunches, and catering expenses
            - software: Software licenses, subscriptions, cloud services, and digital tools
            - rent: Office space rental, coworking memberships, and real estate related costs
            - equipment: Major hardware purchases, computers, machinery, and durable business equipment
            - internet_and_telephone: Internet service, phone plans, mobile devices, and communication expenses
            - facilities_expenses: Utilities, maintenance, cleaning, and other building operation costs
            - activity: Team building events, conferences, training, and professional development
            - taxes: Business tax payments, property taxes, and other tax-related expenses
            - fees: Bank fees, service charges, professional fees, and administrative costs
            
            Transactions: ${JSON.stringify(transactions)}
            
            Important: Return the transactions array in the exact same order as provided.`,
      temperature: 1,
      mode: 'json',
      schema: z.object({
        transactions: z.array(
          z.object({
            category: z
              .enum([
                'travel',
                'office_supplies',
                'meals',
                'software',
                'rent',
                'equipment',
                'internet_and_telephone',
                'facilities_expenses',
                'activity',
                'taxes',
                'fees',
              ])
              .describe('The most appropriate category for the transaction'),
            confidence: z
              .number()
              .min(0)
              .max(1)
              .optional()
              .describe('Confidence score for the category assignment (0-1)'),
          })
        ),
      }),
    });

    return transactions.map((transaction, idx) => ({
      id: transaction.id,
      category_slug: object.transactions[idx]?.category ?? null,
      confidence: object.transactions[idx]?.confidence ?? undefined,
      name: transaction.name,
      description: transaction.description,
    }));
  }

  /**
   * Processes transactions in batches to avoid token limits
   *
   * @param transactions - Array of transactions to process
   * @returns Enriched transactions
   */
  async batchEnrichTransactions(
    transactions: Transaction[]
  ): Promise<EnrichedTransaction[]> {
    const MAX_TOKENS_PER_BATCH = 4000;
    const ESTIMATED_TOKENS_PER_TRANSACTION = 40;

    const batchSize = Math.max(
      1,
      Math.floor(MAX_TOKENS_PER_BATCH / ESTIMATED_TOKENS_PER_TRANSACTION)
    );

    const enrichedTransactions: EnrichedTransaction[] = [];

    // Process in batches to avoid token limits
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      const batchResults = await this.enrichTransactions(batch);

      // Add the batch results to our collection
      enrichedTransactions.push(...batchResults);
    }

    return enrichedTransactions;
  }

  /**
   * Analyzes transactions to determine if they are recurring payments
   *
   * @param transactions - Array of transactions to analyze
   * @returns Enriched transactions with recurring payment information
   */
  async analyzeRecurringTransactions(
    transactions: Transaction[]
  ): Promise<EnrichedTransaction[]> {
    const { object } = await generateObject({
      model: this.model.chat(process.env.AI_GATEWAY_MODEL!),
      prompt: `You are an expert in analyzing financial transactions to identify recurring payments.
            Analyze the transaction details and determine if each transaction appears to be a recurring payment.
            
            Consider subscription services, regular bill payments, membership fees, etc. as recurring payments.
            Look for patterns in transaction names that suggest regular scheduled payments.
            
            Transactions: ${JSON.stringify(transactions)}
            
            Important: Return the transactions array in the exact same order as provided.`,
      temperature: 0.7,
      mode: 'json',
      schema: z.object({
        transactions: z.array(
          z.object({
            is_recurring: z
              .boolean()
              .describe(
                'Whether this transaction appears to be a recurring payment'
              ),
            frequency: z
              .enum(['monthly', 'quarterly', 'annual', 'weekly', 'unknown'])
              .optional()
              .describe(
                'The likely frequency of the recurring payment if applicable'
              ),
          })
        ),
      }),
    });

    return transactions.map((transaction, idx) => ({
      id: transaction.id,
      name: transaction.name,
      category_slug: null,
      is_recurring: object.transactions[idx]?.is_recurring ?? null,
      frequency: object.transactions[idx]?.frequency,
      description: transaction.description,
    }));
  }

  /**
   * Generates more descriptive transaction names from basic merchant data
   *
   * @param transactions - Array of transactions to enhance
   * @returns Transactions with enhanced descriptions
   */
  async enhanceTransactionDescriptions(
    transactions: Transaction[]
  ): Promise<EnrichedTransaction[]> {
    const { object } = await generateObject({
      model: this.model.chat(process.env.AI_GATEWAY_MODEL!),
      prompt: `You are an expert in enhancing financial transaction data to make it more useful for business reporting.
            For each transaction, generate a more descriptive name or purpose that explains what the transaction was likely for.
            
            For example:
            - "AMZN Mktp" might become "Amazon - Office Supplies"
            - "UBER" might become "Uber - Transportation Service"
            - "ADOBE" might become "Adobe - Creative Software Subscription"
            
            Use the transaction amount, date, and existing name to make informed guesses about the transaction purpose.
            
            Transactions: ${JSON.stringify(transactions)}
            
            Important: Return the transactions array in the exact same order as provided.`,
      temperature: 0.8,
      mode: 'json',
      schema: z.object({
        transactions: z.array(
          z.object({
            enhanced_description: z
              .string()
              .describe(
                'A more descriptive explanation of what this transaction was for'
              ),
            purpose: z
              .string()
              .optional()
              .describe('The likely business purpose of this transaction'),
          })
        ),
      }),
    });

    return transactions.map((transaction, idx) => ({
      id: transaction.id,
      name: transaction.name,
      category_slug: null,
      description:
        object.transactions[idx]?.enhanced_description ??
        transaction.description,
      purpose: object.transactions[idx]?.purpose ?? undefined,
    }));
  }

  /**
   * Detects anomalous transactions that differ from usual spending patterns
   *
   * @param transactions - Array of transactions to analyze
   * @returns Enriched transactions with anomaly scores
   */
  async detectAnomalousTransactions(
    transactions: Transaction[]
  ): Promise<EnrichedTransaction[]> {
    const { object } = await generateObject({
      model: this.model.chat(process.env.AI_GATEWAY_MODEL!),
      prompt: `You are an expert in detecting unusual or potentially fraudulent financial transactions.
            For each transaction, analyze if it appears unusual based on:
            - Unexpected merchant types
            - Unusual amounts (particularly high amounts)
            - Unusual locations
            - Unusual timing
            - Suspicious merchant names
            
            Assign an anomaly score between 0 and 1, where:
            - 0.0-0.2: Completely normal transaction
            - 0.2-0.4: Slightly unusual but likely legitimate
            - 0.4-0.6: Moderately unusual, may warrant attention
            - 0.6-0.8: Highly unusual, should be reviewed
            - 0.8-1.0: Extremely suspicious, potential fraud
            
            Also provide a brief reason for any transaction with a score above 0.4.
            
            Transactions: ${JSON.stringify(transactions)}
            
            Important: Return the transactions array in the exact same order as provided.`,
      temperature: 0.7,
      mode: 'json',
      schema: z.object({
        transactions: z.array(
          z.object({
            anomaly_score: z
              .number()
              .min(0)
              .max(1)
              .describe(
                'Score indicating how unusual this transaction appears (0-1)'
              ),
            anomaly_reason: z
              .string()
              .optional()
              .describe(
                'Brief explanation for why this transaction was flagged as unusual'
              ),
          })
        ),
      }),
    });

    return transactions.map((transaction, idx) => ({
      id: transaction.id,
      name: transaction.name,
      category_slug: null,
      anomaly_score: object.transactions[idx]?.anomaly_score ?? null,
      description:
        object.transactions[idx]?.anomaly_reason ?? transaction.description,
    }));
  }

  /**
   * Analyzes transactions for tax and VAT deductibility
   *
   * @param transactions - Array of transactions to analyze
   * @returns Enriched transactions with tax information
   */
  async analyzeTaxDeductibility(
    transactions: Transaction[]
  ): Promise<EnrichedTransaction[]> {
    const { object } = await generateObject({
      model: this.model.chat(process.env.AI_GATEWAY_MODEL!),
      prompt: `You are a tax expert specializing in business expense deductions.
            For each transaction, determine:
            1. If it's likely tax-deductible for a business
            2. If VAT is likely applicable/recoverable
            3. A suggested VAT rate if applicable (standard rates are typically 20%, 17.5%, or 5% depending on the country)
            
            Consider the nature of each transaction and common tax rules for business expenses.
            Common deductible categories include: office supplies, business travel, professional services, software, etc.
            
            Transactions: ${JSON.stringify(transactions)}
            
            Important: Return the transactions array in the exact same order as provided.`,
      temperature: 0.7,
      mode: 'json',
      schema: z.object({
        transactions: z.array(
          z.object({
            tax_deductible: z
              .boolean()
              .describe(
                'Whether this transaction is likely tax-deductible for a business'
              ),
            tax_deduction_reason: z
              .string()
              .optional()
              .describe('Brief explanation of tax deductibility assessment'),
            vat_applicable: z
              .boolean()
              .describe(
                'Whether VAT is likely applicable/recoverable for this transaction'
              ),
            suggested_vat_rate: z
              .number()
              .min(0)
              .max(100)
              .optional()
              .describe('Suggested VAT rate percentage (e.g., 20 for 20%)'),
          })
        ),
      }),
    });

    return transactions.map((transaction, idx) => ({
      id: transaction.id,
      name: transaction.name,
      category_slug: null,
      tax_deductible: object.transactions[idx]?.tax_deductible ?? null,
      vat_applicable: object.transactions[idx]?.vat_applicable ?? null,
      suggested_vat_rate: object.transactions[idx]?.suggested_vat_rate ?? null,
      description:
        object.transactions[idx]?.tax_deduction_reason ??
        transaction.description,
    }));
  }

  /**
   * Enriches merchant information from transaction data
   *
   * @param transactions - Array of transactions to analyze
   * @returns Enriched transactions with merchant details
   */
  async enrichMerchantInformation(
    transactions: Transaction[]
  ): Promise<EnrichedTransaction[]> {
    const { object } = await generateObject({
      model: this.model.chat(process.env.AI_GATEWAY_MODEL!),
      prompt: `You are an expert in merchant data enrichment for financial transactions.
            For each transaction, analyze the merchant name and transaction details to determine:
            1. A standardized merchant category (e.g., "Retail", "Dining", "Travel", "Software")
            2. A likely website domain for the merchant (e.g., "amazon.com", "uber.com")
            3. The merchant's likely physical location category (e.g., "Online", "Local Retail", "Restaurant")
            
            Use the transaction name, amount, and any other available details to make educated inferences.
            
            Transactions: ${JSON.stringify(transactions)}
            
            Important: Return the transactions array in the exact same order as provided.`,
      temperature: 0.7,
      mode: 'json',
      schema: z.object({
        transactions: z.array(
          z.object({
            merchant_category: z
              .string()
              .describe('Standardized merchant category'),
            merchant_website: z
              .string()
              .optional()
              .describe('Likely website domain for the merchant'),
            merchant_location_type: z
              .string()
              .optional()
              .describe(
                'Type of merchant location (Online, Physical Store, etc.)'
              ),
          })
        ),
      }),
    });

    return transactions.map((transaction, idx) => ({
      id: transaction.id,
      name: transaction.name,
      category_slug: null,
      merchant_category: object.transactions[idx]?.merchant_category ?? null,
      merchant_website: object.transactions[idx]?.merchant_website ?? null,
      description: transaction.description,
    }));
  }

  /**
   * Classifies transactions by cash flow type
   *
   * @param transactions - Array of transactions to analyze
   * @returns Enriched transactions with cash flow classification
   */
  async classifyCashFlowTypes(
    transactions: Transaction[]
  ): Promise<EnrichedTransaction[]> {
    const { object } = await generateObject({
      model: this.model.chat(process.env.AI_GATEWAY_MODEL!),
      prompt: `You are a financial analyst specializing in cash flow management.
            For each transaction, determine if it represents:
            1. A fixed expense (recurring with consistent amount - rent, subscription)
            2. A variable expense (fluctuating amounts - groceries, dining, utilities)
            3. A one-time expense (non-recurring - equipment purchase)
            
            Also classify if the transaction appears to be:
            - A "need" (essential expense)
            - A "want" (discretionary/lifestyle expense)
            - An "investment" (business growth, assets, education)
            
            Transactions: ${JSON.stringify(transactions)}
            
            Important: Return the transactions array in the exact same order as provided.`,
      temperature: 0.7,
      mode: 'json',
      schema: z.object({
        transactions: z.array(
          z.object({
            cash_flow_type: z
              .enum(['fixed', 'variable', 'one-time'])
              .describe('Type of cash flow this transaction represents'),
            need_want_category: z
              .enum(['need', 'want', 'investment'])
              .describe(
                'Whether this transaction is a need, want, or investment'
              ),
          })
        ),
      }),
    });

    return transactions.map((transaction, idx) => ({
      id: transaction.id,
      name: transaction.name,
      category_slug: null,
      cash_flow_type: object.transactions[idx]?.cash_flow_type ?? null,
      need_want_category: object.transactions[idx]?.need_want_category ?? null,
      description: transaction.description,
    }));
  }

  /**
   * Classifies transactions as business or personal
   *
   * @param transactions - Array of transactions to analyze
   * @returns Enriched transactions with business/personal classification
   */
  async classifyBusinessTransactions(
    transactions: Transaction[]
  ): Promise<EnrichedTransaction[]> {
    const { object } = await generateObject({
      model: this.model.chat(process.env.AI_GATEWAY_MODEL!),
      prompt: `You are an expert in business accounting and expense classification.
            For each transaction, determine:
            1. Whether it's likely a business or personal expense
            2. The confidence level of this classification
            3. For business expenses, a specific business purpose category (e.g., "Client Entertainment", "Office Operations")
            
            Transactions: ${JSON.stringify(transactions)}
            
            Important: Return the transactions array in the exact same order as provided.`,
      temperature: 0.7,
      mode: 'json',
      schema: z.object({
        transactions: z.array(
          z.object({
            is_business: z
              .boolean()
              .describe(
                'Whether this transaction is likely a business expense'
              ),
            classification_confidence: z
              .number()
              .min(0)
              .max(1)
              .describe(
                'Confidence in the business/personal classification (0-1)'
              ),
            business_purpose: z
              .string()
              .optional()
              .describe('Business purpose category for business expenses'),
          })
        ),
      }),
    });

    return transactions.map((transaction, idx) => ({
      id: transaction.id,
      name: transaction.name,
      category_slug: null,
      is_business: object.transactions[idx]?.is_business ?? null,
      confidence: object.transactions[idx]?.classification_confidence,
      business_purpose: object.transactions[idx]?.business_purpose ?? null,
      description: transaction.description,
    }));
  }

  /**
   * Identifies transaction payment methods and types
   *
   * @param transactions - Array of transactions to analyze
   * @returns Enriched transactions with payment method information
   */
  async identifyTransactionTypes(
    transactions: Transaction[]
  ): Promise<EnrichedTransaction[]> {
    const { object } = await generateObject({
      model: this.model.chat(process.env.AI_GATEWAY_MODEL!),
      prompt: `You are an expert in financial transaction analysis.
            For each transaction, determine:
            1. The likely transaction type (purchase, refund, payment, subscription, transfer, withdrawal, deposit)
            2. The likely payment method (credit card, debit card, ACH, wire transfer, cash, check, digital wallet)
            3. The payment channel (in-person, online, mobile, ATM, bank branch)
            
            Use the transaction name, amount, and any provided payment information to make educated inferences.
            
            Transactions: ${JSON.stringify(transactions)}
            
            Important: Return the transactions array in the exact same order as provided.`,
      temperature: 0.7,
      mode: 'json',
      schema: z.object({
        transactions: z.array(
          z.object({
            transaction_type: z
              .enum([
                'purchase',
                'refund',
                'payment',
                'subscription',
                'transfer',
                'withdrawal',
                'deposit',
                'fee',
                'other',
              ])
              .describe('Type of transaction'),
            payment_method: z
              .string()
              .optional()
              .describe('Method used for payment'),
            payment_channel: z
              .string()
              .optional()
              .describe('Channel through which the transaction occurred'),
          })
        ),
      }),
    });

    return transactions.map((transaction, idx) => ({
      id: transaction.id,
      name: transaction.name,
      category_slug: null,
      transaction_type: object.transactions[idx]?.transaction_type ?? null,
      description: transaction.description,
    }));
  }

  /**
   * Comprehensive transaction enrichment - combines multiple AI analyses
   *
   * @param transactions - Array of transactions to fully enrich
   * @returns Fully enriched transactions
   */
  async completeEnrichment(
    transactions: Transaction[]
  ): Promise<EnrichedTransaction[]> {
    // Process categorization
    const categorizedTransactions =
      await this.batchEnrichTransactions(transactions);

    // Process recurring analysis
    const recurringResults =
      await this.analyzeRecurringTransactions(transactions);

    // Process description enhancement
    const enhancedDescriptions =
      await this.enhanceTransactionDescriptions(transactions);

    // Merge results
    return transactions.map((transaction, idx) => {
      const categorized = categorizedTransactions.find(
        (t) => t.id === transaction.id
      );
      const recurring = recurringResults.find((t) => t.id === transaction.id);
      const enhanced = enhancedDescriptions.find(
        (t) => t.id === transaction.id
      );

      return {
        id: transaction.id,
        name: transaction.name,
        category_slug: categorized?.category_slug ?? null,
        confidence: categorized?.confidence,
        description: enhanced?.description ?? transaction.description,
        is_recurring: recurring?.is_recurring ?? null,
        frequency: recurring?.frequency ?? null,
        purpose: enhanced?.purpose,
      };
    });
  }

  /**
   * Analyzes transaction's impact on budget categories and suggests tags
   *
   * @param transactions - Array of transactions to analyze
   * @returns Enriched transactions with budget impact and tags
   */
  async analyzeBudgetImpactAndTags(
    transactions: Transaction[]
  ): Promise<EnrichedTransaction[]> {
    const { object } = await generateObject({
      model: this.model.chat(process.env.AI_GATEWAY_MODEL!),
      prompt: `You are a financial advisor specializing in personal budgeting and expense management.
            For each transaction, determine:
            1. The impact on budget (high, medium, low) based on amount and transaction type
            2. 3-5 appropriate tags that would help categorize and search for this transaction
            3. The budget category this transaction best belongs to
            
            For example:
            - A $5 coffee might be low impact, with tags like "coffee", "beverage", "dining"
            - A $2000 rent payment would be high impact, with tags like "housing", "essential", "monthly"
            - A $20 rideshare might be medium impact, with tags like "transportation", "rideshare", "travel"
            
            Transactions: ${JSON.stringify(transactions)}
            
            Important: Return the transactions array in the exact same order as provided.`,
      temperature: 0.7,
      mode: 'json',
      schema: z.object({
        transactions: z.array(
          z.object({
            budget_impact: z
              .enum(['high', 'medium', 'low'])
              .describe('Impact of this transaction on the overall budget'),
            suggested_tags: z
              .array(z.string())
              .describe('Suggested tags for this transaction'),
            budget_category: z
              .string()
              .optional()
              .describe('The budget category this transaction best belongs to'),
          })
        ),
      }),
    });

    return transactions.map((transaction, idx) => ({
      id: transaction.id,
      name: transaction.name,
      category_slug: null,
      budget_impact: object.transactions[idx]?.budget_impact ?? null,
      suggested_tags: object.transactions[idx]?.suggested_tags ?? null,
      description: transaction.description,
    }));
  }

  /**
   * Forecasts future occurrences of recurring transactions
   *
   * @param transactions - Array of transactions to analyze
   * @returns Enriched transactions with forecast data
   */
  async forecastFutureTransactions(
    transactions: Transaction[]
  ): Promise<EnrichedTransaction[]> {
    const { object } = await generateObject({
      model: this.model.chat(process.env.AI_GATEWAY_MODEL!),
      prompt: `You are a financial forecasting expert.
            For each transaction, if it appears to be recurring:
            1. Predict the next 3 occurrences with dates
            2. Estimate if the amount is likely to change (increase, decrease, or remain stable)
            3. Identify any seasonal patterns or potential future changes
            
            Use transaction names, dates, amounts, and any other patterns to make your predictions.
            
            Transactions: ${JSON.stringify(transactions)}
            
            Important: Return the transactions array in the exact same order as provided.`,
      temperature: 0.7,
      mode: 'json',
      schema: z.object({
        transactions: z.array(
          z.object({
            is_recurring: z
              .boolean()
              .describe('Whether this appears to be a recurring transaction'),
            forecasted_occurrences: z
              .array(
                z.object({
                  date: z
                    .string()
                    .describe('Forecasted date in YYYY-MM-DD format'),
                  amount: z.number().describe('Forecasted amount'),
                })
              )
              .optional()
              .describe('Predicted future occurrences of this transaction'),
            amount_trend: z
              .enum(['increasing', 'stable', 'decreasing'])
              .optional()
              .describe('Predicted trend of the transaction amount'),
            forecast_confidence: z
              .number()
              .min(0)
              .max(1)
              .optional()
              .describe('Confidence in the forecast (0-1)'),
          })
        ),
      }),
    });

    return transactions.map((transaction, idx) => ({
      id: transaction.id,
      name: transaction.name,
      category_slug: null,
      is_recurring: object.transactions[idx]?.is_recurring ?? null,
      forecast_future_occurrences:
        object.transactions[idx]?.forecasted_occurrences ?? null,
      spending_trend: object.transactions[idx]?.amount_trend ?? null,
      confidence: object.transactions[idx]?.forecast_confidence,
      description: transaction.description,
    }));
  }

  /**
   * Analyzes transactions for expense policy compliance
   *
   * @param transactions - Array of transactions to analyze
   * @returns Enriched transactions with compliance information
   */
  async checkExpensePolicyCompliance(
    transactions: Transaction[]
  ): Promise<EnrichedTransaction[]> {
    const { object } = await generateObject({
      model: this.model.chat(process.env.AI_GATEWAY_MODEL!),
      prompt: `You are a corporate expense compliance expert.
            For each transaction, determine:
            1. Whether it likely complies with standard business expense policies
            2. Any potential compliance issues (missing receipt needed, exceeds meal limits, etc.)
            3. Whether a receipt would typically be required for this transaction
            
            Use common business expense guidelines for your analysis:
            - Meals typically need receipts above $25
            - Entertainment expenses often require business purpose justification
            - Travel expenses need documentation and business purposes
            - Personal expenses should be flagged
            - Unusually large amounts for their category should be flagged
            
            Transactions: ${JSON.stringify(transactions)}
            
            Important: Return the transactions array in the exact same order as provided.`,
      temperature: 0.7,
      mode: 'json',
      schema: z.object({
        transactions: z.array(
          z.object({
            complies_with_policy: z
              .boolean()
              .describe(
                'Whether this transaction likely complies with standard expense policies'
              ),
            compliance_issues: z
              .array(z.string())
              .optional()
              .describe('Potential compliance issues with this transaction'),
            receipt_required: z
              .boolean()
              .describe(
                'Whether a receipt would typically be required for this transaction'
              ),
            approval_recommended: z
              .boolean()
              .optional()
              .describe('Whether manager approval would be recommended'),
          })
        ),
      }),
    });

    return transactions.map((transaction, idx) => ({
      id: transaction.id,
      name: transaction.name,
      category_slug: null,
      expense_policy_compliance:
        object.transactions[idx]?.complies_with_policy ?? null,
      expense_policy_issues:
        object.transactions[idx]?.compliance_issues ?? null,
      receipt_required: object.transactions[idx]?.receipt_required ?? null,
      description: transaction.description,
    }));
  }

  /**
   * Suggests ways to split transactions across multiple categories
   *
   * @param transactions - Array of transactions to analyze
   * @returns Enriched transactions with split suggestions
   */
  async suggestTransactionSplits(
    transactions: Transaction[]
  ): Promise<EnrichedTransaction[]> {
    const { object } = await generateObject({
      model: this.model.chat(process.env.AI_GATEWAY_MODEL!),
      prompt: `You are an accounting expert specializing in expense allocation.
            For transactions that might contain multiple expense categories (like department store purchases
            or business trips with mixed expenses), suggest how the transaction might be split.
            
            For example:
            - A $100 Amazon purchase might be split as $70 Office Supplies (70%) and $30 Electronics (30%)
            - A $1500 travel expense might be split as $800 Airfare (53.3%), $500 Hotel (33.3%), and $200 Meals (13.3%)
            
            Only suggest splits for transactions that appear to potentially contain multiple categories.
            For simple transactions, leave the splits empty.
            
            Transactions: ${JSON.stringify(transactions)}
            
            Important: Return the transactions array in the exact same order as provided.`,
      temperature: 0.7,
      mode: 'json',
      schema: z.object({
        transactions: z.array(
          z.object({
            needs_splitting: z
              .boolean()
              .describe(
                'Whether this transaction likely contains multiple expense categories'
              ),
            suggested_splits: z
              .array(
                z.object({
                  category: z
                    .string()
                    .describe('Suggested category for this portion'),
                  amount: z
                    .number()
                    .describe('Suggested amount for this portion'),
                  percentage: z
                    .number()
                    .describe('Percentage of the total (0-100)'),
                })
              )
              .optional()
              .describe('Suggested ways to split this transaction'),
            split_reason: z
              .string()
              .optional()
              .describe('Reason for suggesting this split'),
          })
        ),
      }),
    });

    return transactions.map((transaction, idx) => ({
      id: transaction.id,
      name: transaction.name,
      category_slug: null,
      isSplit: object.transactions[idx]?.needs_splitting ?? null,
      suggested_splits: object.transactions[idx]?.suggested_splits ?? null,
      description:
        object.transactions[idx]?.split_reason ?? transaction.description,
    }));
  }

  /**
   * Analyzes location data to provide geographic insights
   *
   * @param transactions - Array of transactions to analyze
   * @returns Enriched transactions with location insights
   */
  async analyzeLocationData(
    transactions: Transaction[]
  ): Promise<EnrichedTransaction[]> {
    const { object } = await generateObject({
      model: this.model.chat(process.env.AI_GATEWAY_MODEL!),
      prompt: `You are a geospatial analysis expert for financial transactions.
            For each transaction, analyze the location data (if available) to determine:
            1. If it appears to be a travel-related expense
            2. If the transaction location differs from the user's typical location
            3. If the transaction is in a business district, tourist area, or residential area
            4. For travel expenses, the likely purpose (business trip, vacation, commuting, etc.)
            
            Use merchant name, transaction amount, category, and location coordinates if available.
            
            Transactions: ${JSON.stringify(transactions)}
            
            Important: Return the transactions array in the exact same order as provided.`,
      temperature: 0.7,
      mode: 'json',
      schema: z.object({
        transactions: z.array(
          z.object({
            is_travel_related: z
              .boolean()
              .describe('Whether this appears to be a travel-related expense'),
            location_type: z
              .enum([
                'business_district',
                'tourist_area',
                'residential',
                'transit',
                'unknown',
              ])
              .optional()
              .describe('Type of area where the transaction occurred'),
            travel_purpose: z
              .string()
              .optional()
              .describe('Likely purpose of travel for travel-related expenses'),
            location_insights: z
              .string()
              .optional()
              .describe('Additional insights about the transaction location'),
          })
        ),
      }),
    });

    return transactions.map((transaction, idx) => ({
      id: transaction.id,
      name: transaction.name,
      category_slug: null,
      travel_purpose: object.transactions[idx]?.travel_purpose ?? null,
      location_insights: object.transactions[idx]?.location_insights ?? null,
      description: transaction.description,
    }));
  }

  /**
   * Analyzes foreign currency transactions for exchange rate insights
   *
   * @param transactions - Array of transactions to analyze
   * @returns Enriched transactions with currency analysis
   */
  async analyzeForeignTransactions(
    transactions: Transaction[]
  ): Promise<EnrichedTransaction[]> {
    const { object } = await generateObject({
      model: this.model.chat(process.env.AI_GATEWAY_MODEL!),
      prompt: `You are a financial expert specializing in foreign exchange and international transactions.
            For each transaction, determine:
            1. If it appears to be a foreign transaction (different currency)
            2. The likely exchange rate used (if both base and local amounts are provided)
            3. Whether the exchange rate seems fair or potentially includes hidden fees
            4. The volatility category of the currency used (high/medium/low)
            
            Consider transaction amounts, currencies, merchants, and any indicators of international activity.
            
            Transactions: ${JSON.stringify(transactions)}
            
            Important: Return the transactions array in the exact same order as provided.`,
      temperature: 0.7,
      mode: 'json',
      schema: z.object({
        transactions: z.array(
          z.object({
            is_foreign_transaction: z
              .boolean()
              .describe(
                'Whether this appears to be a foreign currency transaction'
              ),
            exchange_rate: z
              .number()
              .optional()
              .describe('Calculated or estimated exchange rate'),
            currency_volatility: z
              .enum(['high', 'medium', 'low'])
              .optional()
              .describe('Volatility category of the currency used'),
            has_hidden_fees: z
              .boolean()
              .optional()
              .describe('Whether the exchange rate suggests hidden fees'),
            original_currency: z
              .string()
              .optional()
              .describe('Likely original currency code'),
          })
        ),
      }),
    });

    return transactions.map((transaction, idx) => ({
      id: transaction.id,
      name: transaction.name,
      category_slug: null,
      foreign_transaction_analysis: object.transactions[idx]
        ?.is_foreign_transaction
        ? {
          exchange_rate: object.transactions[idx]?.exchange_rate,
          original_currency: object.transactions[idx]?.original_currency,
          currency_volatility: object.transactions[idx]?.currency_volatility,
        }
        : null,
      description: transaction.description,
    }));
  }

  /**
   * Compares transactions to peer spending patterns
   *
   * @param transactions - Array of transactions to analyze
   * @returns Enriched transactions with peer comparison insights
   */
  async analyzePeerComparison(
    transactions: Transaction[]
  ): Promise<EnrichedTransaction[]> {
    const { object } = await generateObject({
      model: this.model.chat(process.env.AI_GATEWAY_MODEL!),
      prompt: `You are a financial data scientist specializing in consumer spending patterns.
            For each transaction, estimate whether the amount spent is higher, lower, or about average
            compared to typical spending in this category. Consider:
            
            1. The merchant category and type
            2. The transaction amount
            3. Typical spending patterns for businesses or consumers
            
            For example:
            - A $300 dinner might be higher than average
            - A $80 mobile phone bill would be about average
            - A $5 coffee would be about average
            - A $1000 laptop repair would be higher than average
            
            Transactions: ${JSON.stringify(transactions)}
            
            Important: Return the transactions array in the exact same order as provided.`,
      temperature: 0.7,
      mode: 'json',
      schema: z.object({
        transactions: z.array(
          z.object({
            peer_comparison: z
              .enum(['higher', 'average', 'lower'])
              .describe(
                'How this transaction compares to typical spending in this category'
              ),
            comparison_reasoning: z
              .string()
              .optional()
              .describe('Reason for the peer comparison evaluation'),
            typical_amount_range: z
              .object({
                min: z
                  .number()
                  .describe('Typical minimum amount for this category'),
                max: z
                  .number()
                  .describe('Typical maximum amount for this category'),
              })
              .optional()
              .describe('Typical amount range for this category'),
          })
        ),
      }),
    });

    return transactions.map((transaction, idx) => ({
      id: transaction.id,
      name: transaction.name,
      category_slug: null,
      peer_comparison: object.transactions[idx]?.peer_comparison ?? null,
      description:
        object.transactions[idx]?.comparison_reasoning ??
        transaction.description,
    }));
  }

  /**
   * Analyzes the impact of transactions on financial health
   *
   * @param transactions - Array of transactions to analyze
   * @returns Enriched transactions with financial health impact
   */
  async analyzeFinancialHealthImpact(
    transactions: Transaction[]
  ): Promise<EnrichedTransaction[]> {
    const { object } = await generateObject({
      model: this.model.chat(process.env.AI_GATEWAY_MODEL!),
      prompt: `You are a financial wellness advisor specializing in personal and business financial health.
            For each transaction, evaluate:
            1. The impact on overall financial health (positive, neutral, negative)
            2. Whether this transaction represents good financial behavior
            3. Suggestions to optimize or improve this spending in the future
            
            Consider the transaction amount, category, frequency, and necessity.
            
            Transactions: ${JSON.stringify(transactions)}
            
            Important: Return the transactions array in the exact same order as provided.`,
      temperature: 0.7,
      mode: 'json',
      schema: z.object({
        transactions: z.array(
          z.object({
            financial_health_impact: z
              .enum(['positive', 'neutral', 'negative'])
              .describe(
                'Impact of this transaction on overall financial health'
              ),
            financial_behavior: z
              .enum(['good', 'neutral', 'concerning'])
              .optional()
              .describe(
                'Assessment of the financial behavior represented by this transaction'
              ),
            optimization_suggestion: z
              .string()
              .optional()
              .describe(
                'Suggestion for optimizing or improving this type of spending'
              ),
          })
        ),
      }),
    });

    return transactions.map((transaction, idx) => ({
      id: transaction.id,
      name: transaction.name,
      category_slug: null,
      financial_health_impact:
        object.transactions[idx]?.financial_health_impact ?? null,
      description:
        object.transactions[idx]?.optimization_suggestion ??
        transaction.description,
    }));
  }

  /**
   * Analyzes merchant reputation and reliability
   *
   * @param transactions - Array of transactions to analyze
   * @returns Enriched transactions with merchant reputation data
   */
  async analyzeMerchantReputation(
    transactions: Transaction[]
  ): Promise<EnrichedTransaction[]> {
    const { object } = await generateObject({
      model: this.model.chat(process.env.AI_GATEWAY_MODEL!),
      prompt: `You are an expert in merchant analysis and business reputation.
            For each transaction, assess:
            1. The likely reputation of the merchant (excellent, good, average, poor, unknown)
            2. Whether the merchant appears to be a major established business or a smaller/newer entity
            3. Any potential risk factors associated with this merchant
            
            Base your assessment on the merchant name, transaction amount, category, and any other available details.
            
            Transactions: ${JSON.stringify(transactions)}
            
            Important: Return the transactions array in the exact same order as provided.`,
      temperature: 0.7,
      mode: 'json',
      schema: z.object({
        transactions: z.array(
          z.object({
            merchant_reputation: z
              .enum(['excellent', 'good', 'average', 'poor', 'unknown'])
              .describe("Assessment of the merchant's likely reputation"),
            merchant_size: z
              .enum(['major', 'medium', 'small', 'unknown'])
              .optional()
              .describe('Size/establishment of the merchant'),
            merchant_risk_score: z
              .number()
              .min(0)
              .max(100)
              .optional()
              .describe(
                'Risk score for this merchant (0-100, where higher means more risk)'
              ),
            risk_factors: z
              .array(z.string())
              .optional()
              .describe('Potential risk factors associated with this merchant'),
          })
        ),
      }),
    });

    return transactions.map((transaction, idx) => ({
      id: transaction.id,
      name: transaction.name,
      category_slug: null,
      merchant_reputation:
        object.transactions[idx]?.merchant_reputation ?? null,
      merchant_risk_score:
        object.transactions[idx]?.merchant_risk_score ?? null,
      description: transaction.description,
    }));
  }

  /**
   * Comprehensive advanced enrichment - combines all available analyses into a
   * master view
   *
   * @param transactions - Array of transactions to fully enrich with all
   *   possible analyses
   * @returns Comprehensively enriched transaction data
   */
  async masterEnrichment(
    transactions: Transaction[]
  ): Promise<EnrichedTransaction[]> {
    // Run all enrichment analyses in parallel for maximum efficiency
    const [
      // Existing analyses
      categorized,
      recurring,
      enhanced,
      anomalies,
      taxInfo,
      merchantInfo,
      cashFlowInfo,
      businessInfo,
      transactionTypeInfo,
      // New analyses
      budgetAndTags,
      forecastInfo,
      policyCompliance,
      splitSuggestions,
      locationInfo,
      foreignCurrencyInfo,
      peerComparison,
      financialHealthInfo,
      merchantReputation,
    ] = await Promise.all([
      // Existing analyses
      this.batchEnrichTransactions(transactions),
      this.analyzeRecurringTransactions(transactions),
      this.enhanceTransactionDescriptions(transactions),
      this.detectAnomalousTransactions(transactions),
      this.analyzeTaxDeductibility(transactions),
      this.enrichMerchantInformation(transactions),
      this.classifyCashFlowTypes(transactions),
      this.classifyBusinessTransactions(transactions),
      this.identifyTransactionTypes(transactions),
      // New analyses
      this.analyzeBudgetImpactAndTags(transactions),
      this.forecastFutureTransactions(transactions),
      this.checkExpensePolicyCompliance(transactions),
      this.suggestTransactionSplits(transactions),
      this.analyzeLocationData(transactions),
      this.analyzeForeignTransactions(transactions),
      this.analyzePeerComparison(transactions),
      this.analyzeFinancialHealthImpact(transactions),
      this.analyzeMerchantReputation(transactions),
    ]);

    // Merge all enrichment results into comprehensive transaction objects
    return transactions.map((transaction) => {
      // Find corresponding enrichment results for this transaction
      const categorizedItem = categorized.find((t) => t.id === transaction.id);
      const recurringItem = recurring.find((t) => t.id === transaction.id);
      const enhancedItem = enhanced.find((t) => t.id === transaction.id);
      const anomalyItem = anomalies.find((t) => t.id === transaction.id);
      const taxItem = taxInfo.find((t) => t.id === transaction.id);
      const merchantItem = merchantInfo.find((t) => t.id === transaction.id);
      const cashFlowItem = cashFlowInfo.find((t) => t.id === transaction.id);
      const businessItem = businessInfo.find((t) => t.id === transaction.id);
      const transactionTypeItem = transactionTypeInfo.find(
        (t) => t.id === transaction.id
      );
      const budgetTagsItem = budgetAndTags.find((t) => t.id === transaction.id);
      const forecastItem = forecastInfo.find((t) => t.id === transaction.id);
      const policyItem = policyCompliance.find((t) => t.id === transaction.id);
      const splitItem = splitSuggestions.find((t) => t.id === transaction.id);
      const locationItem = locationInfo.find((t) => t.id === transaction.id);
      const foreignCurrencyItem = foreignCurrencyInfo.find(
        (t) => t.id === transaction.id
      );
      const peerItem = peerComparison.find((t) => t.id === transaction.id);
      const healthItem = financialHealthInfo.find(
        (t) => t.id === transaction.id
      );
      const reputationItem = merchantReputation.find(
        (t) => t.id === transaction.id
      );

      // Create comprehensive enriched transaction
      return {
        id: transaction.id,
        name: transaction.name,
        // Basic categorization and description
        category_slug: categorizedItem?.category_slug ?? null,
        confidence: categorizedItem?.confidence ?? forecastItem?.confidence,
        description: enhancedItem?.description ?? transaction.description,

        // Recurring patterns
        is_recurring: recurringItem?.is_recurring ?? null,
        frequency: recurringItem?.frequency ?? null,
        forecast_future_occurrences:
          forecastItem?.forecast_future_occurrences ?? null,

        // Purpose and business use
        purpose: enhancedItem?.purpose ?? businessItem?.business_purpose,
        business_purpose: businessItem?.business_purpose ?? null,
        is_business: businessItem?.is_business ?? null,

        // Risk and anomaly detection
        anomaly_score: anomalyItem?.anomaly_score ?? null,
        merchant_risk_score: reputationItem?.merchant_risk_score ?? null,
        merchant_reputation: reputationItem?.merchant_reputation ?? null,

        // Tax and financial compliance
        tax_deductible: taxItem?.tax_deductible ?? null,
        vat_applicable: taxItem?.vat_applicable ?? null,
        suggested_vat_rate: taxItem?.suggested_vat_rate ?? null,
        expense_policy_compliance:
          policyItem?.expense_policy_compliance ?? null,
        expense_policy_issues: policyItem?.expense_policy_issues ?? null,
        receipt_required: policyItem?.receipt_required ?? null,

        // Merchant and location information
        merchant_category: merchantItem?.merchant_category ?? null,
        merchant_website: merchantItem?.merchant_website ?? null,
        location_insights: locationItem?.location_insights ?? null,
        travel_purpose: locationItem?.travel_purpose ?? null,

        // Transaction classification
        transaction_type: transactionTypeItem?.transaction_type ?? null,
        cash_flow_type: cashFlowItem?.cash_flow_type ?? null,
        need_want_category: cashFlowItem?.need_want_category ?? null,

        // Budget impact and management
        budget_impact: budgetTagsItem?.budget_impact ?? null,
        suggested_tags: budgetTagsItem?.suggested_tags ?? null,
        spending_trend: forecastItem?.spending_trend ?? null,
        financial_health_impact: healthItem?.financial_health_impact ?? null,
        peer_comparison: peerItem?.peer_comparison ?? null,

        // Split transaction handling
        isSplit: splitItem?.suggested_splits ?? null,
        suggested_splits: splitItem?.suggested_splits ?? null,

        // Foreign currency analysis
        foreign_transaction_analysis:
          foreignCurrencyItem?.foreign_transaction_analysis ?? null,

        // Similar transaction detection
        similar_transactions_count: transaction.isRecurring ? 1 : 0,
      };
    });
  }
}
