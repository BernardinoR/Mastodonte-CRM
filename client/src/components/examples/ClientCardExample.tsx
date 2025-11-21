import { ClientCard } from '../ClientCard';

export default function ClientCardExample() {
  return (
    <div className="p-6 space-y-4 bg-background">
      <ClientCard
        id="1"
        name="Alessandro Cuçulin Mazer"
        email="mazer.ale@hotmail.com"
        phone="+55 16 99708-716"
        status="Ativo"
        folderLink="https://drive.google.com/drive/folders/example"
      />
      <ClientCard
        id="2"
        name="Fernanda Carolina De Faria"
        email="fernanda@example.com"
        phone="+55 11 98765-4321"
        status="Prospect"
      />
      <ClientCard
        id="3"
        name="Gustavo Samconi Soares"
        status="Inativo"
      />
    </div>
  );
}
