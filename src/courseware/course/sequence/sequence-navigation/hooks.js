import { useSelector } from 'react-redux';
import { useModel } from '../../../../generic/model-store';
import { sequenceIdsSelector } from '../../../data';

export function useSequenceNavigationMetadata(currentSequenceId, currentUnitId) {
  const sequenceIds = useSelector(sequenceIdsSelector);
  const sequence = useModel('sequences', currentSequenceId);
  const courseStatus = useSelector(state => state.courseware.courseStatus);
  const sequenceStatus = useSelector(state => state.courseware.sequenceStatus);

  // Early return if data isn't fully loaded, IDs are missing, or sequence/unit data is incomplete
  if (courseStatus !== 'loaded' || sequenceStatus !== 'loaded' || !currentSequenceId || !currentUnitId || !sequence || !sequence.unitIds) {
    return { isFirstUnit: false, isLastUnit: false, totalUnits: 0, completedUnits: 0 };
  }

  // Fetch all units at once to adhere to rules of hooks
  const units = sequence.unitIds.map(unitId => useModel('units', unitId));

  const totalUnits = sequence.unitIds.length;
  const completedUnits = units.reduce((acc, unit) => acc + (unit?.complete ? 1 : 0), 0);

  const isFirstSequence = sequenceIds.indexOf(currentSequenceId) === 0;
  const isFirstUnitInSequence = sequence.unitIds.indexOf(currentUnitId) === 0;
  const isFirstUnit = isFirstSequence && isFirstUnitInSequence;
  const isLastSequence = sequenceIds.indexOf(currentSequenceId) === sequenceIds.length - 1;
  const isLastUnitInSequence = sequence.unitIds.indexOf(currentUnitId) === sequence.unitIds.length - 1;
  const isLastUnit = isLastSequence && isLastUnitInSequence;

  return { isFirstUnit, isLastUnit, totalUnits, completedUnits };
}
