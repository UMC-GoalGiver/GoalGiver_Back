const {
  getGoalByInstanceId,
  insertGoalValidation,
} = require('../models/goal-model');

/**
 * @function calculateLocation
 * @description 현재 위치를 저장된 목표 위치와 비교하여 인증합니다.
 * @param {number} instanceId - 목표 인스턴스 ID
 * @param {number} currentLatitude - 현재 위도
 * @param {number} currentLongitude - 현재 경도
 * @returns {Promise<boolean>} 위치가 허용 범위 내에 있는 경우 true, 그렇지 않으면 false를 반환
 * @throws {Error} 목표를 찾을 수 없는 경우 오류 발생
 */
exports.calculateLocation = async (
  instanceId,
  currentLatitude,
  currentLongitude
) => {
  const goal = await getGoalByInstanceId(instanceId);
  if (!goal) {
    throw new Error('목표가 없습니다');
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
  if (distance <= allowedDistance) {
    await insertGoalValidation(
      goal.id,
      instanceId,
      currentLatitude,
      currentLongitude
    );
    return true;
  }
  return false;
};

/**
 * @function calculateDistance
 * @description 두 지점 간의 거리를 계산합니다.
 * @param {number} lat1 - 첫 번째 지점의 위도
 * @param {number} lon1 - 첫 번째 지점의 경도
 * @param {number} lat2 - 두 번째 지점의 위도
 * @param {number} lon2 - 두 번째 지점의 경도
 * @returns {number} 두 지점 간의 거리 (미터)
 */
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

  return distance;
};
