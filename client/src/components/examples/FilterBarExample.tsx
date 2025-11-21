import { FilterBar } from '../FilterBar';
import { useState } from 'react';

export default function FilterBarExample() {
  const [search, setSearch] = useState('');
  const [assignee, setAssignee] = useState('all');
  const [priority, setPriority] = useState('all');

  return (
    <div className="p-6 bg-background">
      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        assigneeFilter={assignee}
        onAssigneeChange={setAssignee}
        priorityFilter={priority}
        onPriorityChange={setPriority}
      />
    </div>
  );
}
