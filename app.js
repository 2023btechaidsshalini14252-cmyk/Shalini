const tickets = [
  { id:'HD-1048', title:'Laptop will not boot before client demo', customer:'Marcus Wong', initials:'MW', tone:'pink', priority:'Urgent', due:'Overdue by 1h 12m', dueLabel:'Due at 9:00 AM', overdue:true, assignee:'Priya Shah', mine:true },
  { id:'HD-1047', title:'VPN connection dropping frequently', customer:'Elena Garcia', initials:'EG', tone:'yellow', priority:'Urgent', due:'Overdue by 38m', dueLabel:'Due at 9:30 AM', overdue:true, assignee:'Marcus Lee', mine:false },
  { id:'HD-1042', title:'New starter access for Amina Yusuf', customer:'Amina Yusuf', initials:'AY', tone:'', priority:'Urgent', due:'In 42 minutes', dueLabel:'Due at 11:00 AM', overdue:false, assignee:'Priya Shah', mine:true },
  { id:'HD-1045', title:'Cannot access shared finance drive', customer:'Nora Patel', initials:'NP', tone:'yellow', priority:'Normal', due:'Overdue by 2h 05m', dueLabel:'Due yesterday', overdue:true, assignee:'Priya Shah', mine:true },
  { id:'HD-1044', title:'Request: 32-inch monitor upgrade', customer:'James Kim', initials:'JK', tone:'pink', priority:'Normal', due:'Today, 3:00 PM', dueLabel:'In 4 hours', overdue:false, assignee:'Marcus Lee', mine:false },
  { id:'HD-1041', title:'Email signature not displaying correctly', customer:'Sofia Reed', initials:'SR', tone:'', priority:'Normal', due:'Tomorrow, 10:00 AM', dueLabel:'In 19 hours', overdue:false, assignee:'Priya Shah', mine:true },
  { id:'HD-1039', title:'Reset MFA after phone replacement', customer:'Owen Brooks', initials:'OB', tone:'yellow', priority:'Urgent', due:'Tomorrow, 11:30 AM', dueLabel:'In 20 hours', overdue:false, assignee:'Marcus Lee', mine:false },
  { id:'HD-1038', title:'Printer queue stuck on floor 2', customer:'Lila Chen', initials:'LC', tone:'pink', priority:'Normal', due:'Tomorrow, 1:00 PM', dueLabel:'In 22 hours', overdue:false, assignee:'Priya Shah', mine:true },
  { id:'HD-1036', title:'Install Figma for design team', customer:'Theo Martin', initials:'TM', tone:'', priority:'Normal', due:'Wed, 9:00 AM', dueLabel:'In 2 days', overdue:false, assignee:'Marcus Lee', mine:false },
  { id:'HD-1035', title:'Calendar invites are not syncing', customer:'Rhea Shah', initials:'RS', tone:'yellow', priority:'Normal', due:'Wed, 2:00 PM', dueLabel:'In 2 days', overdue:false, assignee:'Priya Shah', mine:true },
  { id:'HD-1032', title:'Replace cracked laptop screen', customer:'Dylan Cole', initials:'DC', tone:'pink', priority:'Urgent', due:'Thu, 10:00 AM', dueLabel:'In 3 days', overdue:false, assignee:'Marcus Lee', mine:false },
  { id:'HD-1031', title:'Add contractor to Slack workspace', customer:'Maya Singh', initials:'MS', tone:'', priority:'Normal', due:'Thu, 4:00 PM', dueLabel:'In 3 days', overdue:false, assignee:'Priya Shah', mine:true }
];

function escalateBreachedTickets(ticketList) {
  const nextPriority = { Normal: 'High', High: 'Urgent', Urgent: 'Urgent' };
  return ticketList.reduce((escalatedCount, ticket) => {
    if (ticket.overdue) {
      const next = nextPriority[ticket.priority] || ticket.priority;
      if (next !== ticket.priority) {
        ticket.priority = next;
        escalatedCount += 1;
      }
    }
    return escalatedCount;
  }, 0);
}

escalateBreachedTickets(tickets);

let activeFilter = 'all';
let currentPage = 1;
const pageSize = 6;
const rows = document.querySelector('#ticketRows');
const emptyState = document.querySelector('#emptyState');
const searchInput = document.querySelector('#searchInput');
const statusFilter = document.querySelector('#statusFilter');
const assigneeFilter = document.querySelector('#assigneeFilter');

function filteredTickets() {
  const query = searchInput.value.trim().toLowerCase();
  return tickets.filter(ticket => {
    const matchesTab = activeFilter === 'all' || (activeFilter === 'overdue' && ticket.overdue) || (activeFilter === 'mine' && ticket.mine);
    const matchesSearch = !query || `${ticket.id} ${ticket.title} ${ticket.customer}`.toLowerCase().includes(query);
    const matchesStatus = statusFilter.value === 'all' || ticket.priority.toLowerCase() === statusFilter.value;
    const matchesAssignee = assigneeFilter.value === 'all' || ticket.assignee === assigneeFilter.value;
    return matchesTab && matchesSearch && matchesStatus && matchesAssignee;
  });
}

function renderTickets() {
  const visible = filteredTickets();
  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  currentPage = Math.min(currentPage, totalPages);
  const pageTickets = visible.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  rows.innerHTML = pageTickets.map(ticket => `
    <tr>
      <td><input type="checkbox" aria-label="Select ${ticket.id}"></td>
      <td><span class="ticket-link">${ticket.title}</span><span class="ticket-id">${ticket.id}</span></td>
      <td><span class="customer"><span class="avatar ${ticket.tone}">${ticket.initials}</span>${ticket.customer}</span></td>
      <td><span class="priority ${ticket.priority.toLowerCase()}"><i></i>${ticket.priority}</span></td>
      <td><span class="due ${ticket.overdue ? 'overdue' : ''}">${ticket.due}</span><small class="due ${ticket.overdue ? 'overdue' : ''}">${ticket.dueLabel}</small></td>
      <td><span class="assignee"><span class="avatar">${ticket.assignee.split(' ').map(name => name[0]).join('')}</span>${ticket.assignee}</span></td>
      <td><button class="row-menu" aria-label="More actions for ${ticket.id}">···</button></td>
    </tr>`).join('');
  emptyState.hidden = pageTickets.length > 0;
  document.querySelector('#queueTotal').textContent = `${visible.length} ticket${visible.length === 1 ? '' : 's'}`;
  const start = visible.length ? (currentPage - 1) * pageSize + 1 : 0;
  document.querySelector('#pageLabel').textContent = `Showing ${start}-${Math.min(currentPage * pageSize, visible.length)} of ${visible.length} tickets`;
  document.querySelectorAll('.page-number').forEach((button, index) => { button.textContent = index + 1; button.classList.toggle('active', index + 1 === currentPage); button.hidden = index + 1 > totalPages; });
  document.querySelector('#prevPage').disabled = currentPage === 1;
  document.querySelector('#nextPage').disabled = currentPage === totalPages;
  const applied = (activeFilter !== 'all' ? 1 : 0) + (statusFilter.value !== 'all' ? 1 : 0) + (assigneeFilter.value !== 'all' ? 1 : 0);
  document.querySelector('#filterBadge').textContent = applied;
}

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => { document.querySelector('.tab.active').classList.remove('active'); tab.classList.add('active'); activeFilter = tab.dataset.filter; currentPage = 1; renderTickets(); }));
searchInput.addEventListener('input', () => { currentPage = 1; renderTickets(); });
statusFilter.addEventListener('change', () => { currentPage = 1; renderTickets(); });
assigneeFilter.addEventListener('change', () => { currentPage = 1; renderTickets(); });
document.querySelector('#filterButton').addEventListener('click', () => { const panel = document.querySelector('#filterPanel'); panel.hidden = !panel.hidden; });
document.querySelector('#clearFilters').addEventListener('click', () => { activeFilter = 'all'; statusFilter.value = 'all'; assigneeFilter.value = 'all'; searchInput.value = ''; document.querySelector('.tab.active').classList.remove('active'); document.querySelector('[data-filter="all"]').classList.add('active'); currentPage = 1; renderTickets(); });
document.querySelector('#prevPage').addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderTickets(); } });
document.querySelector('#nextPage').addEventListener('click', () => { if (!document.querySelector('#nextPage').disabled) { currentPage++; renderTickets(); } });
document.querySelectorAll('.page-number').forEach(button => button.addEventListener('click', () => { currentPage = Number(button.textContent); renderTickets(); }));
document.querySelector('#newTicket').addEventListener('click', () => { const toast = document.querySelector('#toast'); toast.textContent = 'New ticket form is ready to open.'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2400); });
document.addEventListener('keydown', event => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchInput.focus(); } });
renderTickets();