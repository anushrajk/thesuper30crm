import "./globals.css";
import { TaskProvider } from './context/TaskContext';
import { TeamProvider } from './context/TeamContext';
import { ClientProvider } from './context/ClientContext';
import { CampaignProvider } from './context/CampaignContext';
import { NoteProvider } from './context/NoteContext';
import { ReminderProvider } from './context/ReminderContext';
import { BillingProvider } from './context/BillingContext';
import { PortalAuthProvider } from './context/PortalAuthContext';
import { RequestProvider } from './context/RequestContext';
import { MessageProvider } from './context/MessageContext';
import TaskDetailPanel from './components/TaskDetailPanel';
import AuthGuard from './components/AuthGuard';

export const metadata = {
  title: "Super 30 | Agency OS",
  description: "The Agency Operating System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <ClientProvider>
          <PortalAuthProvider>
            <TeamProvider>
              <TaskProvider>
                <RequestProvider>
                  <MessageProvider>
                    <CampaignProvider>
                      <NoteProvider>
                        <ReminderProvider>
                          <BillingProvider>
                            <AuthGuard>
                              {children}
                              <TaskDetailPanel />
                            </AuthGuard>
                          </BillingProvider>
                        </ReminderProvider>
                      </NoteProvider>
                    </CampaignProvider>
                  </MessageProvider>
                </RequestProvider>
              </TaskProvider>
            </TeamProvider>
          </PortalAuthProvider>
        </ClientProvider>
      </body>
    </html>
  );
}
