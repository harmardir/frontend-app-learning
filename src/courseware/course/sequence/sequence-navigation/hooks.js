import { useSelector } from 'react-redux';
import { useModel } from '../../../../generic/model-store';
import { sequenceIdsSelector } from '../../../data';

export function useSequenceNavigationMetadata(currentSequenceId, currentUnitId) {
  const sequenceIds = useSelector(sequenceIdsSelector);
  console.log("Sequence IDs:", sequenceIds);  // Log the sequence IDs array

  const sequence = useModel('sequences', currentSequenceId);
  console.log("Current Sequence:", sequence);  // Log the sequence object

  const courseStatus = useSelector(state => state.courseware.courseStatus);
  const sequenceStatus = useSelector(state => state.courseware.sequenceStatus);
  console.log("Course Status:", courseStatus, "Sequence Status:", sequenceStatus);  // Log statuses

  // Check for loaded states and presence of necessary IDs before proceeding
  if (courseStatus !== 'loaded' || sequenceStatus !== 'loaded' || !currentSequenceId || !currentUnitId || !sequence || !sequence.unitIds) {
    console.log("Early exit conditions met:", {courseStatus, sequenceStatus, currentSequenceId, currentUnitId, sequence});
    return { isFirstUnit: false, isLastUnit: false, totalUnits: 0, completedUnits: 0 };
  }

  console.log("Unit IDs:", sequence.unitIds);  // Ensure unitIds are defined
  const units = sequence.unitIds.map(unitId => useModel('units', unitId));
  console.log("Units after mapping:", units);  // Check the array returned from the map

  const totalUnits = sequence?.unitIds?.length || 0;
  console.log("Total Units:", totalUnits);  // Log total units calculated

  const completedUnits = units.reduce((acc, unit) => acc + (unit?.complete ? 1 : 0), 0);
  console.log("Completed Units:", completedUnits);  // Log completed units calculation

  const isFirstSequence = sequenceIds.indexOf(currentSequenceId) === 0;
  console.log("Is First Sequence:", isFirstSequence);  // Log if it's the first sequence

  const isFirstUnitInSequence = sequence?.unitIds?.indexOf(currentUnitId) === 0;
  console.log("Is First Unit in Sequence:", isFirstUnitInSequence);  // Log if it's the first unit in the sequence

  const isLastSequence = sequenceIds.indexOf(currentSequenceId) === sequenceIds.length - 1;
  console.log("Is Last Sequence:", isLastSequence);  // Log if it's the last sequence

  const isLastUnitInSequence = sequence?.unitIds?.indexOf(currentUnitId) === sequence.unitIds.length - 1;
  console.log("Is Last Unit in Sequence:", isLastUnitInSequence);  // Log if it's the last unit in the sequence

  return {
    isFirstUnit: isFirstSequence && isFirstUnitInSequence,
    isLastUnit: isLastSequence && isLastUnitInSequence,
    totalUnits,
    completedUnits
  };
}
