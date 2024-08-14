function timeAgo(timestamp) {
  const createdAt = moment(timestamp);
  const now = moment();
  const diffYears = now.diff(createdAt, 'years');
  const diffMonths = now.diff(createdAt, 'months');
  const diffWeeks = Math.floor(now.diff(createdAt, 'weeks'));
  const diffDays = Math.floor(now.diff(createdAt, 'days'));
  let timeAgo;
  switch (true) {
    case diffYears > 0:
      timeAgo = `${diffYears}y`;
      break;
    case diffMonths > 0:
      timeAgo = `${diffMonths}m`;
      break;
    case diffWeeks > 0:
      timeAgo = `${diffWeeks}w`;
      break;
    case diffDays > 0:
      timeAgo = `${diffDays}d`;
      break;
    default:
      timeAgo = '0d';
  }
  return timeAgo;
}