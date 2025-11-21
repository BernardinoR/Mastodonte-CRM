import { NewClientDialog } from '../NewClientDialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function NewClientDialogExample() {
  const [open, setOpen] = useState(true);

  return (
    <div className="p-6 bg-background">
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <NewClientDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={(data) => console.log('Client created:', data)}
      />
    </div>
  );
}
