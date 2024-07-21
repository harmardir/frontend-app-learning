import { useSelector } from 'react-redux';
import { useModel } from '../../../../generic/model-store';
import { sequenceIdsSelector } from '../../../data';

export function useSequenceNavigationMetadata(currentSequenceId, currentUnitId) {
  const sequenceIds = useSelector(sequenceIdsSelector);
  const sequence = useModel('sequences', currentSequenceId);
  const courseStatus = useSelector(state => state.courseware.courseStatus);
  const sequenceStatus = useSelector(state => state.courseware.sequenceStatus);

  if (courseStatus !== 'loaded' || sequenceStatus !== 'loaded' || !currentSequenceId || !sequence || !sequence.unitIds) {
    console.log("Early exit conditions met:", {courseStatus, sequenceStatus, currentSequenceId, sequence});
    return { isFirstUnit: false, isLastUnit: false, totalUnits: 0, completedUnits: 0 };
  }

  // Check if sequence.unitIds is safely accessible and non-empty
  if (sequence && sequence.unitIds && sequence.unitIds.length > 0) {
    const units = sequence.unitIds.map(unitId => {
        const unit = useModel('units', unitId);
        console.log("Mapped unit:", unit); // Log each unit fetched by useModel
        return unit;
    });
    console.log("Units after mapping:", units);

    const totalUnits = sequence.unitIds.length;
    const completedUnits = units.reduce((acc, unit) => acc + (unit?.complete ? 1 : 0), 0);

    const isFirstSequence = sequenceIds.indexOf(currentSequenceId) === 0;
    const isFirstUnitInSequence = sequence.unitIds.indexOf(currentUnitId) === 0;
    const isLastSequence = sequenceIds.indexOf(currentSequenceId) === sequenceIds.length - 1;
    const isLastUnitInSequence = sequence.unitIds.indexOf(currentUnitId) === sequence.unitIds.length - 1;

    return {
        isFirstUnit: isFirstSequence && isFirstUnitInSequence,
        isLastUnit: isLastSequence && isLastUnitInSequence,
        totalUnits,
        completedUnits
    };
  } else {
    console.log("Error: sequence or sequence.unitIds is undefined or empty");
    return { isFirstUnit: false, isLastUnit: false, totalUnits: 0, completedUnits: 0 }; // Provide a safe default return
  }
}
