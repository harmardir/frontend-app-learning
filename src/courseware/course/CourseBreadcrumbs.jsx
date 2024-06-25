import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { SelectMenu } from '@edx/paragon';
import { Link } from 'react-router-dom';
import { useModel, useModels } from '../../generic/model-store';
import { MMP2PFlyoverTrigger } from '../../experiments/mm-p2p';
import JumpNavMenuItem from './JumpNavMenuItem';

function CourseBreadcrumb({
  content, withSeparator, courseId, sequenceId, unitId, isStaff,
}) {
  const defaultContent = content.filter(destination => destination.default)[0] || { id: courseId, label: '', sequences: [] };
  return (
    <>
      {withSeparator && <li className="breadcrumb-separator">/</li>}
      <li>
        <Link to={`/course/${courseId}/${defaultContent.id}`}>
          {defaultContent.label}
        </Link>
        {defaultContent.sequences.map((seq) => (
          <Link key={seq.id} to={`/course/${courseId}/${seq.id}`}>
            {seq.title}
            {seq.units.map((unit) => (
              <Link key={unit.id} to={`/course/${courseId}/${seq.id}/${unit.id}`}>
                {unit.title}
              </Link>
            ))}
          </Link>
        ))}
      </li>
    </>
  );
}

export default function CourseBreadcrumbs({
  courseId,
  sectionId,
  sequenceId,
  unitId,
  isStaff,
  mmp2p,
}) {
  const course = useModel('coursewareMeta', courseId);
  const courseStatus = useSelector(state => state.courseware.courseStatus);
  const sequenceStatus = useSelector(state => state.courseware.sequenceStatus);

  const allSequencesInSections = useMemo(() => {
    const sections = useModels('sections', course?.sectionIds);
    return sections.map(section => ({
      ...section,
      sequences: section.sequenceIds.map(seqId => {
        const sequence = useModel('sequences', seqId);
        return {
          ...sequence,
          units: sequence.unitIds.map(unitId => useModel('units', unitId))
        };
      })
    }));
  }, [course?.sectionIds]);

  const links = useMemo(() => {
    if (courseStatus !== 'loaded' || sequenceStatus !== 'loaded') return [];

    return allSequencesInSections.flatMap(section => section.sequences.flatMap(sequence => ({
      id: sequence.id,
      label: sequence.title,
      sequences: sequence.units
    })));
  }, [courseStatus, sequenceStatus, allSequencesInSections]);

  return (
    <nav aria-label="breadcrumb" className="my-4 d-inline-block col-sm-10">
      <ol className="list-unstyled d-flex flex-nowrap align-items-center m-0">
        <li className="list-unstyled col-auto m-0 p-0">
          <Link className="flex-shrink-0 text-primary" to={`/course/${courseId}/home`}>
            <FontAwesomeIcon icon={faHome} className="mr-2" />
            <FormattedMessage id="learn.breadcrumb.navigation.course.home" defaultMessage="Course" />
          </Link>
        </li>
        {links.map((content, index) => (
          <CourseBreadcrumb
            key={index}
            courseId={courseId}
            sequenceId={sequenceId}
            content={content}
            unitId={unitId}
            withSeparator={index > 0}
            isStaff={isStaff}
          />
        ))}
        {mmp2p.state && mmp2p.state.isEnabled && <MMP2PFlyoverTrigger options={mmp2p} />}
      </ol>
    </nav>
  );
}
