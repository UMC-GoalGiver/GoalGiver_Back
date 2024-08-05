const { getGoalById } = require('../models/goal-model');

exports.calculateLocation = async (
  goalId,
  currentLatitude,
  currentLongitude
) => {
  const goal = await getGoalById(goalId);
  if (!goal) {
    throw new Error('목표가 없습니다');
  } else {
    console.log(goal);
  }

  const savedLatitude = goal.latitude;
  const savedLongitude = goal.longitude;

  const distance = calculateDistance(
    savedLatitude,
    savedLongitude,
    currentLatitude,
    currentLongitude
  );

  const allowedDistance = 50; // 오차 범위 - 50미터
  return distance <= allowedDistance;
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRadians = (degrees) => degrees * (Math.PI / 180);

  const earthRadius = 6371e3;

  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = earthRadius * c; // 두 지점 간의 거리 (미터)

  console.log(distance);

  return distance;
};
