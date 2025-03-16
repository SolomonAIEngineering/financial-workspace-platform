import { ConnectTransactionsProvider } from "@/components/bank-connection/connect-transactions-context";
import { ConnectTransactionsWrapper } from "@/components/bank-connection/connect-transactions-wrapper";
import { trpc } from "@/trpc/server";

export default async function BankConnectionLayout({ children }: { children: React.ReactNode }) {
    const currentUser = (await trpc.layout.app()).currentUser;

    return (
        <ConnectTransactionsProvider defaultUserId={currentUser.id as string}>
            {children}
        </ConnectTransactionsProvider>
    );
}