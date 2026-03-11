const CLASS_MAP = {
  Booked: 'badge-booked',
  Collected: 'badge-collected',
  'In Transit': 'badge-transit',
  'Customs Clearance': 'badge-customs',
  'Out for Delivery': 'badge-outdelivery',
  Delivered: 'badge-delivered',
};

const StatusBadge = ({ status }) => (
  <span className={`badge ${CLASS_MAP[status] || 'badge-booked'}`}>{status}</span>
);

export default StatusBadge;
