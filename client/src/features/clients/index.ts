// Feature: Clients
// Gerenciamento de clientes e seus detalhes

// Pages
export { default as Clients } from './pages/Clients';
export { default as ClientDetails } from './pages/ClientDetails';

// Components
export { ClientCard } from './components/ClientCard';
export { ClientProfile } from './components/ClientProfile';
export { ClientStatusBadge } from './components/ClientStatusBadge';
export { NewClientDialog } from './components/NewClientDialog';
export { NewClientInlineCard } from './components/NewClientInlineCard';
export { AddressPopover } from './components/AddressPopover';
export { AdvisorPopover } from './components/AdvisorPopover';
export { EmailsPopover } from './components/EmailsPopover';
export { FoundationCodeField } from './components/FoundationCodeField';
export { WhatsAppGroupsTable } from './components/WhatsAppGroupsTable';

// Client Details Components
export * from './components/client-details';

// Clients Page Components
export * from './components/clients-page';

// Contexts
export { ClientsProvider, useClients } from './contexts/ClientsContext';

// Hooks
export { useClientsPage } from './hooks/useClientsPage';
export { useClientHeaderEditing } from './hooks/useClientHeaderEditing';
export { useInlineClientMeetings } from './hooks/useInlineClientMeetings';
export { useInlineClientTasks } from './hooks/useInlineClientTasks';

// Lib
export * from './lib/clientSections';
export * from './lib/clientUtils';

// Types
export * from './types/client';
