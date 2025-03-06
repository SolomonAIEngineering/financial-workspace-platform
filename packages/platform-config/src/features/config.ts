import { Environment, FeatureFlag, Validator } from "./flags/types";

/**
 * Feature flag validators for ensuring proper configuration
 */
const validators = {
  // Spend limit validators
  spendLimits: {
    validateSpendLimit: (value: number) => value >= 0 && value <= 1000000,
    validateDailyLimit: (value: number) => value >= 0 && value <= 100000,
    validateTransactionLimit: (value: number) => value >= 0 && value <= 50000,
  },

  // Time-based validators
  timing: {
    validateExpiryDate: (date: Date) => date > new Date(),
    validateScheduledTime: (time: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time),
    validateTimeZone: (zone: string) => Intl.DateTimeFormat().resolvedOptions().timeZone === zone,
  },

  // Permission validators
  permissions: {
    validateRoleAccess: (roles: string[]) =>
      roles.every((role) => ["admin", "manager", "user"].includes(role)),
    validateDepartmentAccess: (departments: string[]) => departments.length > 0,
    validateApprovalLevel: (level: number) => level >= 1 && level <= 5,
  },

  // Integration validators
  integrations: {
    validateApiKey: (key: string) => /^[A-Za-z0-9-_]{20,}$/.test(key),
    validateWebhookUrl: (url: string) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },
    validateIntegrationType: (type: string) =>
      ["erp", "accounting", "banking", "hrms"].includes(type),
  },

  // Analytics validators
  analytics: {
    validateMetricName: (name: string) => /^[a-zA-Z][a-zA-Z0-9_]{2,30}$/.test(name),
    validateDataSource: (source: string) =>
      ["transactions", "expenses", "budgets", "forecasts"].includes(source),
    validateAggregation: (type: string) => ["sum", "average", "count", "min", "max"].includes(type),
  },

  // Policy validators
  policies: {
    validatePolicyName: (name: string) => name.length >= 3 && name.length <= 50,
    validatePolicyRule: (rule: object) => Object.keys(rule).length > 0,
    validatePolicyPriority: (priority: number) => priority >= 1 && priority <= 10,
  },

  // Category validators
  categories: {
    validateCategoryName: (name: string) => name.length >= 2 && name.length <= 30,
    validateCategoryHierarchy: (path: string[]) => path.length <= 5,
    validateCategoryCode: (code: string) => /^[A-Z0-9]{2,10}$/.test(code),
  },

  // Workflow validators
  workflows: {
    validateWorkflowSteps: (steps: any[]) => steps.length >= 1 && steps.length <= 10,
    validateApprovalChain: (chain: string[]) => chain.length >= 1 && chain.length <= 5,
    validateNotificationConfig: (config: object) => "channel" in config && "recipients" in config,
  },

  // Budget validators
  budgets: {
    validateBudgetAmount: (amount: number) => amount >= 0 && amount <= 10000000,
    validateBudgetPeriod: (period: string) => ["monthly", "quarterly", "annual"].includes(period),
    validateBudgetAllocation: (allocation: object) =>
      Object.values(allocation).reduce((a: any, b: any) => a + b, 0) === 100,
  },

  // Supplier validators
  suppliers: {
    validateSupplierName: (name: string) => name.length >= 2 && name.length <= 100,
    validateSupplierCode: (code: string) => /^SUP[0-9]{6}$/.test(code),
    validateTaxId: (taxId: string) => /^[0-9A-Z]{9,15}$/.test(taxId),
  },

  // Expense validators
  expenses: {
    validateExpenseAmount: (amount: number) => amount >= 0 && amount <= 1000000,
    validateReceiptFormat: (format: string) => ["jpg", "png", "pdf"].includes(format.toLowerCase()),
    validateExpenseDate: (date: Date) => date <= new Date(),
    validateMileageRate: (rate: number) => rate >= 0 && rate <= 5,
    validatePerDiemRate: (rate: number) => rate >= 0 && rate <= 1000,
    validateExpenseCategory: (category: string) => category.length >= 2 && category.length <= 50,
  },

  // Payment validators
  payments: {
    validatePaymentMethod: (method: string) => ["card", "bank", "wire", "cash"].includes(method),
    validateCardNumber: (number: string) => /^[0-9]{16}$/.test(number),
    validateCurrency: (currency: string) => /^[A-Z]{3}$/.test(currency),
    validateExchangeRate: (rate: number) => rate > 0 && rate <= 1000,
    validatePaymentStatus: (status: string) =>
      ["pending", "processing", "completed", "failed"].includes(status),
  },

  // User validators
  users: {
    validateEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    validatePassword: (password: string) =>
      password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password),
    validateUsername: (username: string) => /^[a-zA-Z0-9_]{3,30}$/.test(username),
    validatePhoneNumber: (phone: string) => /^\+?[1-9]\d{1,14}$/.test(phone),
  },

  // Security validators
  security: {
    validateIpAddress: (ip: string) => /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip),
    validateAuthToken: (token: string) =>
      /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(token),
    validatePermissionLevel: (level: number) => level >= 0 && level <= 100,
    validateSecurityGroup: (group: string) => ["admin", "user", "guest"].includes(group),
  },

  // Report validators
  reports: {
    validateReportName: (name: string) => name.length >= 3 && name.length <= 100,
    validateDateRange: (start: Date, end: Date) => start <= end,
    validateReportFormat: (format: string) =>
      ["pdf", "csv", "xlsx", "json"].includes(format.toLowerCase()),
    validateScheduleInterval: (interval: string) =>
      ["daily", "weekly", "monthly", "quarterly"].includes(interval),
  },

  // Feature validators
  features: {
    validateFeatureKey: (key: string) => /^[a-zA-Z][a-zA-Z0-9_]{2,50}$/.test(key),
    validateEnvKey: (key: string) => /^[A-Z][A-Z0-9_]{2,50}$/.test(key),
    validateDescription: (desc: string) => desc.length >= 10 && desc.length <= 500,
    validateEnvironment: (env: string) => ["development", "staging", "production"].includes(env),
  },
};

/**
 * Default environment configuration
 */
const defaultEnvironments = {
  development: {
    NODE_ENV: "development" as Environment,
  },
  production: {
    NODE_ENV: "production" as Environment,
  },
};

/**
 * Web application feature flags configuration with metadata
 * Organized by core business domains and features
 */
export const webAppFeatureFlags: FeatureFlag[] = [
  // Expense Management & Tracking Features
  {
    key: "enableExpenseCapture",
    envKey: "ENABLE_EXPENSE_CAPTURE",
    description:
      "Enable multi-channel expense capture from receipts, invoices, and digital payments",
    defaultValue: true,
    environments: defaultEnvironments.development,
    validators: {
      amount: validators.expenses.validateExpenseAmount as Validator<number>,
      format: validators.expenses.validateReceiptFormat as Validator<string>,
      category: validators.expenses.validateExpenseCategory as Validator<string>,
    },
  },
  {
    key: "enableReceiptScanning",
    envKey: "ENABLE_RECEIPT_SCANNING",
    description: "AI-powered receipt scanning and data extraction",
    defaultValue: true,
    environments: defaultEnvironments.development,
    validators: {
      format: validators.expenses.validateReceiptFormat as Validator<string>,
      date: validators.expenses.validateExpenseDate as Validator<Date>,
    },
  },
  {
    key: "enableExpenseCategories",
    envKey: "ENABLE_EXPENSE_CATEGORIES",
    description: "Dynamic expense categorization based on merchant and transaction data",
    defaultValue: true,
    environments: defaultEnvironments.development,
    validators: {
      category: validators.expenses.validateExpenseCategory as Validator<string>,
    },
  },
  {
    key: "enableExpenseRouting",
    envKey: "ENABLE_EXPENSE_ROUTING",
    description: "Intelligent expense routing based on department, project, and approval hierarchy",
    defaultValue: true,
  },
  {
    key: "enableExpenseReports",
    envKey: "ENABLE_EXPENSE_REPORTS",
    description: "Automated expense report generation and submission workflows",
    defaultValue: true,
  },
  {
    key: "enableMileageTracking",
    envKey: "ENABLE_MILEAGE_TRACKING",
    description: "GPS-based mileage tracking and reimbursement calculation",
    defaultValue: true,
    environments: defaultEnvironments.development,
    validators: {
      rate: validators.expenses.validateMileageRate as Validator<number>,
    },
  },
  {
    key: "enablePerDiemCalculation",
    envKey: "ENABLE_PER_DIEM_CALCULATION",
    description: "Automated per diem calculations based on location and duration",
    defaultValue: true,
    environments: defaultEnvironments.development,
    validators: {
      rate: validators.expenses.validatePerDiemRate as Validator<number>,
    },
  },
  {
    key: "enableDuplicateDetection",
    envKey: "ENABLE_DUPLICATE_DETECTION",
    description: "Smart duplicate expense detection and prevention",
    defaultValue: true,
  },
  {
    key: "enablePolicyCompliance",
    envKey: "ENABLE_POLICY_COMPLIANCE",
    description: "Automated expense policy compliance checking",
    defaultValue: true,
  },
  {
    key: "enableAuditTrails",
    envKey: "ENABLE_AUDIT_TRAILS",
    description: "Detailed audit trails for all expense-related activities",
    defaultValue: true,
    environments: defaultEnvironments.development,
  },

  // Payment Processing & Transactions Features
  {
    key: "enableVirtualCards",
    envKey: "ENABLE_VIRTUAL_CARDS",
    description: "Issue and manage virtual cards for employee spending",
    defaultValue: true,
    environments: defaultEnvironments.development,
    validators: {
      cardNumber: validators.payments.validateCardNumber as Validator<string>,
    },
  },
  {
    key: "enablePaymentApproval",
    envKey: "ENABLE_PAYMENT_APPROVAL",
    description: "Multi-level payment approval workflows",
    defaultValue: true,
  },
  {
    key: "enableBulkPayments",
    envKey: "ENABLE_BULK_PAYMENTS",
    description: "Process multiple payments in batch transactions",
    defaultValue: true,
  },
  {
    key: "enableInternationalPayments",
    envKey: "ENABLE_INTERNATIONAL_PAYMENTS",
    description: "Support for cross-border payments and currency conversion",
    defaultValue: true,
    environments: defaultEnvironments.development,
    validators: {
      currency: validators.payments.validateCurrency as Validator<string>,
      exchangeRate: validators.payments.validateExchangeRate as Validator<number>,
    },
  },
  {
    key: "enableRecurringPayments",
    envKey: "ENABLE_RECURRING_PAYMENTS",
    description: "Schedule and manage recurring payment transactions",
    defaultValue: true,
  },
  {
    key: "enablePaymentLimits",
    envKey: "ENABLE_PAYMENT_LIMITS",
    description: "Configurable spending limits and controls",
    defaultValue: true,
    environments: defaultEnvironments.development,
    validators: {
      limit: validators.spendLimits.validateSpendLimit as Validator<number>,
      daily: validators.spendLimits.validateDailyLimit as Validator<number>,
      transaction: validators.spendLimits.validateTransactionLimit as Validator<number>,
    },
  },
  {
    key: "enableRealTimePayments",
    envKey: "ENABLE_REAL_TIME_PAYMENTS",
    description: "Instant payment processing and settlement",
    defaultValue: true,
  },
  {
    key: "enablePaymentDisputes",
    envKey: "ENABLE_PAYMENT_DISPUTES",
    description: "Manage payment disputes and chargebacks",
    defaultValue: false,
    environments: defaultEnvironments.development,
  },
  {
    key: "enablePaymentAnalytics",
    envKey: "ENABLE_PAYMENT_ANALYTICS",
    description: "Advanced payment analytics and reporting",
    defaultValue: true,
  },
  {
    key: "enableFraudDetection",
    envKey: "ENABLE_FRAUD_DETECTION",
    description: "AI-powered fraud detection and prevention",
    defaultValue: true,
  },

  // Budget Management & Controls Features
  {
    key: "enableBudgetPlanning",
    envKey: "ENABLE_BUDGET_PLANNING",
    description: "Department and project-based budget planning",
    defaultValue: true,
    environments: defaultEnvironments.development,
    validators: {
      amount: validators.budgets.validateBudgetAmount as Validator<number>,
      period: validators.budgets.validateBudgetPeriod as Validator<string>,
      allocation: validators.budgets.validateBudgetAllocation as Validator<object>,
    },
  },
  {
    key: "enableBudgetForecasting",
    envKey: "ENABLE_BUDGET_FORECASTING",
    description: "AI-powered budget forecasting and trend analysis",
    defaultValue: true,
    environments: defaultEnvironments.development,
  },
  {
    key: "enableSpendAnalytics",
    envKey: "ENABLE_SPEND_ANALYTICS",
    description: "Real-time spend analytics and insights",
    defaultValue: false,
    environments: defaultEnvironments.development,
  },
  {
    key: "enableCostAllocation",
    envKey: "ENABLE_COST_ALLOCATION",
    description: "Automated cost allocation across departments and projects",
    defaultValue: true,
  },
  {
    key: "enableBudgetAlerts",
    envKey: "ENABLE_BUDGET_ALERTS",
    description: "Real-time budget alerts and notifications",
    defaultValue: true,
  },
  {
    key: "enableSpendControls",
    envKey: "ENABLE_SPEND_CONTROLS",
    description: "Granular spending controls and permissions",
    defaultValue: true,
  },
  {
    key: "enableVendorManagement",
    envKey: "ENABLE_VENDOR_MANAGEMENT",
    description: "Vendor relationship and contract management",
    defaultValue: true,
  },
  {
    key: "enableCustomReporting",
    envKey: "ENABLE_CUSTOM_REPORTING",
    description: "Custom report builder for financial analysis",
    defaultValue: true,
  },
  {
    key: "enableBudgetTemplates",
    envKey: "ENABLE_BUDGET_TEMPLATES",
    description: "Reusable budget templates and configurations",
    defaultValue: false,
    environments: defaultEnvironments.development,
  },
  {
    key: "enableSpendInsights",
    envKey: "ENABLE_SPEND_INSIGHTS",
    description: "AI-powered spending insights and recommendations",
    defaultValue: false,
    environments: defaultEnvironments.development,
  },

  // Integration & Connectivity Features
  {
    key: "enableAccountingSync",
    envKey: "ENABLE_ACCOUNTING_SYNC",
    description: "Integration with accounting systems for automated reconciliation",
    defaultValue: true,
    environments: defaultEnvironments.development,
    validators: {
      type: validators.integrations.validateIntegrationType as Validator<string>,
      apiKey: validators.integrations.validateApiKey as Validator<string>,
    },
  },
  {
    key: "enableERPIntegration",
    envKey: "ENABLE_ERP_INTEGRATION",
    description: "ERP system integration for financial data sync",
    defaultValue: true,
    environments: defaultEnvironments.development,
  },
  {
    key: "enableBankingSync",
    envKey: "ENABLE_BANKING_SYNC",
    description: "Real-time banking integration for transaction sync",
    defaultValue: false,
    environments: defaultEnvironments.development,
  },
  {
    key: "enableHRMSIntegration",
    envKey: "ENABLE_HRMS_INTEGRATION",
    description: "HRMS integration for employee data and permissions",
    defaultValue: true,
    environments: defaultEnvironments.development,
  },
  {
    key: "enableSlackIntegration",
    envKey: "ENABLE_SLACK_INTEGRATION",
    description: "Slack integration for expense notifications and approvals",
    defaultValue: true,
    environments: defaultEnvironments.development,
  },
  {
    key: "enableQuickbooksIntegration",
    envKey: "ENABLE_QUICKBOOKS_INTEGRATION",
    description: "QuickBooks integration for financial sync",
    defaultValue: false,
    environments: defaultEnvironments.development,
  },
  {
    key: "enableXeroIntegration",
    envKey: "ENABLE_XERO_INTEGRATION",
    description: "Xero integration for accounting sync",
    defaultValue: false,
    environments: defaultEnvironments.development,
  },
  {
    key: "enableSageIntegration",
    envKey: "ENABLE_SAGE_INTEGRATION",
    description: "Sage integration for financial management",
    defaultValue: false,
    environments: defaultEnvironments.development,
  },
  {
    key: "enableZapierIntegration",
    envKey: "ENABLE_ZAPIER_INTEGRATION",
    description: "Zapier integration for custom automation workflows",
    defaultValue: true,
    environments: defaultEnvironments.development,
  },
  {
    key: "enableWebhookIntegration",
    envKey: "ENABLE_WEBHOOK_INTEGRATION",
    description: "Custom webhook support for third-party integrations",
    defaultValue: true,
    environments: defaultEnvironments.development,
  },

  // Product Management Features
  {
    key: "enableProductCatalog",
    envKey: "ENABLE_PRODUCT_CATALOG",
    description: "Product catalog management and organization",
    defaultValue: true,
    environments: defaultEnvironments.development,
  },
  {
    key: "enableProductVariants",
    envKey: "ENABLE_PRODUCT_VARIANTS",
    description: "Support for product variants and options",
    defaultValue: true,
  },
  {
    key: "enableInventoryManagement",
    envKey: "ENABLE_INVENTORY_MANAGEMENT",
    description: "Real-time inventory tracking and management",
    defaultValue: true,
  },
  {
    key: "enableProductBundles",
    envKey: "ENABLE_PRODUCT_BUNDLES",
    description: "Create and manage product bundles and kits",
    defaultValue: false,
    environments: defaultEnvironments.development,
  },
  {
    key: "enableDigitalProducts",
    envKey: "ENABLE_DIGITAL_PRODUCTS",
    description: "Support for digital products and downloads",
    defaultValue: true,
  },

  // Benefits Management Features
  {
    key: "enableBenefitsEnrollment",
    envKey: "ENABLE_BENEFITS_ENROLLMENT",
    description: "Employee benefits enrollment and management",
    defaultValue: true,
  },
  {
    key: "enableHealthcareBenefits",
    envKey: "ENABLE_HEALTHCARE_BENEFITS",
    description: "Healthcare benefits administration",
    defaultValue: true,
    environments: defaultEnvironments.development,
  },
  {
    key: "enableRetirementPlans",
    envKey: "ENABLE_RETIREMENT_PLANS",
    description: "401(k) and retirement plan management",
    defaultValue: true,
  },
  {
    key: "enableBenefitsReporting",
    envKey: "ENABLE_BENEFITS_REPORTING",
    description: "Benefits utilization and cost reporting",
    defaultValue: true,
  },
  {
    key: "enableWellnessPrograms",
    envKey: "ENABLE_WELLNESS_PROGRAMS",
    description: "Employee wellness program management",
    defaultValue: false,
    environments: defaultEnvironments.development,
  },

  // Customer Management Features
  {
    key: "enableCustomerProfiles",
    envKey: "ENABLE_CUSTOMER_PROFILES",
    description: "Comprehensive customer profile management",
    defaultValue: true,
  },
  {
    key: "enableCustomerSegmentation",
    envKey: "ENABLE_CUSTOMER_SEGMENTATION",
    description: "Advanced customer segmentation and targeting",
    defaultValue: true,
  },
  {
    key: "enableLoyaltyProgram",
    envKey: "ENABLE_LOYALTY_PROGRAM",
    description: "Customer loyalty program and rewards",
    defaultValue: false,
    environments: defaultEnvironments.development,
  },
  {
    key: "enableCustomerFeedback",
    envKey: "ENABLE_CUSTOMER_FEEDBACK",
    description: "Customer feedback and survey management",
    defaultValue: true,
  },
  {
    key: "enableCustomerSupport",
    envKey: "ENABLE_CUSTOMER_SUPPORT",
    description: "Integrated customer support and ticketing",
    defaultValue: true,
  },

  // Sales Management Features
  {
    key: "enableSalesForecasting",
    envKey: "ENABLE_SALES_FORECASTING",
    description: "AI-powered sales forecasting and planning",
    defaultValue: true,
    environments: defaultEnvironments.development,
  },
  {
    key: "enableSalesQuotes",
    envKey: "ENABLE_SALES_QUOTES",
    description: "Sales quote generation and management",
    defaultValue: true,
  },
  {
    key: "enableCommissionTracking",
    envKey: "ENABLE_COMMISSION_TRACKING",
    description: "Sales commission calculation and tracking",
    defaultValue: true,
  },
  {
    key: "enableSalesTerritory",
    envKey: "ENABLE_SALES_TERRITORY",
    description: "Sales territory management and assignment",
    defaultValue: false,
    environments: defaultEnvironments.development,
  },
  {
    key: "enableOpportunityManagement",
    envKey: "ENABLE_OPPORTUNITY_MANAGEMENT",
    description: "Sales opportunity tracking and pipeline management",
    defaultValue: true,
  },

  // Storefront Features
  {
    key: "enableMultiStore",
    envKey: "ENABLE_MULTI_STORE",
    description: "Multi-store management and configuration",
    defaultValue: false,
    environments: defaultEnvironments.development,
  },
  {
    key: "enableStorefrontSearch",
    envKey: "ENABLE_STOREFRONT_SEARCH",
    description: "Advanced storefront search and filtering",
    defaultValue: true,
  },
  {
    key: "enableRecommendations",
    envKey: "ENABLE_RECOMMENDATIONS",
    description: "AI-powered product recommendations",
    defaultValue: true,
    environments: defaultEnvironments.development,
  },
  {
    key: "enableWishlist",
    envKey: "ENABLE_WISHLIST",
    description: "Customer wishlist functionality",
    defaultValue: true,
  },
  {
    key: "enableStoreLocator",
    envKey: "ENABLE_STORE_LOCATOR",
    description: "Physical store location finder",
    defaultValue: true,
  },

  // Analytics Features
  {
    key: "enableCustomAnalytics",
    envKey: "ENABLE_CUSTOM_ANALYTICS",
    description: "Custom analytics dashboard and reporting",
    defaultValue: true,
    environments: defaultEnvironments.development,
  },
  {
    key: "enablePredictiveAnalytics",
    envKey: "ENABLE_PREDICTIVE_ANALYTICS",
    description: "AI-powered predictive analytics and insights",
    defaultValue: false,
    environments: defaultEnvironments.development,
  },
  {
    key: "enableRealTimeAnalytics",
    envKey: "ENABLE_REAL_TIME_ANALYTICS",
    description: "Real-time data analytics and monitoring",
    defaultValue: true,
  },
  {
    key: "enableCustomReports",
    envKey: "ENABLE_CUSTOM_REPORTS",
    description: "Custom report builder and scheduling",
    defaultValue: true,
  },
  {
    key: "enableDataExport",
    envKey: "ENABLE_DATA_EXPORT",
    description: "Data export and integration capabilities",
    defaultValue: true,
  },

  // Finance Features
  {
    key: "enableFinancialReporting",
    envKey: "ENABLE_FINANCIAL_REPORTING",
    description: "Comprehensive financial reporting suite",
    defaultValue: true,
  },
  {
    key: "enableBudgetManagement",
    envKey: "ENABLE_BUDGET_MANAGEMENT",
    description: "Budget planning and tracking",
    defaultValue: true,
  },
  {
    key: "enableRevenueAnalytics",
    envKey: "ENABLE_REVENUE_ANALYTICS",
    description: "Revenue analytics and forecasting",
    defaultValue: true,
    environments: defaultEnvironments.development,
  },
  {
    key: "enableTaxManagement",
    envKey: "ENABLE_TAX_MANAGEMENT",
    description: "Tax calculation and compliance management",
    defaultValue: true,
  },
  {
    key: "enableMultiCurrency",
    envKey: "ENABLE_MULTI_CURRENCY",
    description: "Multi-currency support and exchange rates",
    defaultValue: false,
    environments: defaultEnvironments.development,
  },

  // Purchase & Procurement Features
  {
    key: "enablePurchaseOrders",
    envKey: "ENABLE_PURCHASE_ORDERS",
    description: "Create and manage purchase orders with approval workflows",
    defaultValue: true,
    environments: defaultEnvironments.development,
  },
  {
    key: "enableSupplierPortal",
    envKey: "ENABLE_SUPPLIER_PORTAL",
    description: "Self-service supplier portal for quote submission and order management",
    defaultValue: false,
    environments: defaultEnvironments.development,
  },
  {
    key: "enableProcurementAnalytics",
    envKey: "ENABLE_PROCUREMENT_ANALYTICS",
    description: "Advanced analytics for procurement spend and supplier performance",
    defaultValue: true,
  },
  {
    key: "enableContractManagement",
    envKey: "ENABLE_CONTRACT_MANAGEMENT",
    description: "Supplier contract lifecycle management and compliance",
    defaultValue: true,
  },
  {
    key: "enableRFQManagement",
    envKey: "ENABLE_RFQ_MANAGEMENT",
    description: "Request for quote management and supplier bidding",
    defaultValue: false,
    environments: defaultEnvironments.development,
  },

  // Advanced Spend Management Features
  {
    key: "enableSpendClassification",
    envKey: "ENABLE_SPEND_CLASSIFICATION",
    description: "AI-powered spend classification and categorization",
    defaultValue: true,
    environments: defaultEnvironments.development,
  },
  {
    key: "enableSpendOptimization",
    envKey: "ENABLE_SPEND_OPTIMIZATION",
    description: "ML-driven spend optimization recommendations",
    defaultValue: false,
    environments: defaultEnvironments.development,
  },
  {
    key: "enablePreApprovedSpending",
    envKey: "ENABLE_PRE_APPROVED_SPENDING",
    description: "Pre-approved spending limits and automated approvals",
    defaultValue: true,
  },
  {
    key: "enableSpendForecasting",
    envKey: "ENABLE_SPEND_FORECASTING",
    description: "Predictive spend forecasting and budget planning",
    defaultValue: true,
  },
  {
    key: "enableCostCenterManagement",
    envKey: "ENABLE_COST_CENTER_MANAGEMENT",
    description: "Hierarchical cost center management and reporting",
    defaultValue: true,
  },
  {
    key: "enableSpendAggregation",
    envKey: "ENABLE_SPEND_AGGREGATION",
    description: "Cross-department spend aggregation and analysis",
    defaultValue: true,
  },
  {
    key: "enableSpendBenchmarking",
    envKey: "ENABLE_SPEND_BENCHMARKING",
    description: "Industry benchmarking for spend categories",
    defaultValue: false,
    environments: defaultEnvironments.development,
  },
  {
    key: "enableCustomSpendPolicies",
    envKey: "ENABLE_CUSTOM_SPEND_POLICIES",
    description: "Configurable spend policies and approval matrices",
    defaultValue: true,
  },
  {
    key: "enableRealTimeSpendTracking",
    envKey: "ENABLE_REAL_TIME_SPEND_TRACKING",
    description: "Real-time spend monitoring and alerts",
    defaultValue: true,
  },
  {
    key: "enableSpendAnomalyDetection",
    envKey: "ENABLE_SPEND_ANOMALY_DETECTION",
    description: "AI-powered detection of unusual spending patterns",
    defaultValue: true,
    environments: defaultEnvironments.development,
  },
];
