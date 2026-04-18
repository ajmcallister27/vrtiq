export function getCurrentUserRatings({ user, ratings = [] }) {
  const currentUserId = user?.id;
  const currentUserEmail = user?.email;

  if (!currentUserId && !currentUserEmail) {
    return [];
  }

  return ratings.filter((rating) => (
    (currentUserEmail && rating.created_by === currentUserEmail)
    || (currentUserId && (
      rating.created_by === currentUserId
      || rating.created_by_id === currentUserId
      || rating.user_id === currentUserId
    ))
  ));
}

export function getFavoriteResortIdSet({ user, ratings = [], runs = [] }) {
  const currentUserRatings = getCurrentUserRatings({ user, ratings });

  const resortIds = currentUserRatings
    .map((rating) => runs.find((run) => run.id === rating.run_id)?.resort_id)
    .filter(Boolean);

  return new Set(resortIds);
}
