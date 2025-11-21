import { NewTaskDialog } from '../NewTaskDialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function NewTaskDialogExample() {
  const [open, setOpen] = useState(true);

  return (
    <div className="p-6 bg-background">
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <NewTaskDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={(data) => console.log('Task created:', data)}
      />
    </div>
  );
}
