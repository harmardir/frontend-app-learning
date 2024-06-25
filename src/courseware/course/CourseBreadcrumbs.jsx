import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';
import { useModel, useModels } from '../../generic/model-store';

function CourseBreadcrumb({
  content, withSeparator, courseId, sequenceId, unitId, isStaff,
}) {
  const defaultContent = content.filter(destination => destination.default)[0] || { id: courseId, label: '', sequences: [] };
  return (
    <>
      {withSeparator && (
        <li className="breadcrumb-separator">/</li>
      )}
      <li>
        <Link to={`/course/${courseId}/${defaultContent.id}`}>
          {defaultContent.label}
        </Link>
      </li>
      {defaultContent.sequences.length > 0 && (
        <li>
          <Link to={`/course/${courseId}/${defaultContent.sequences[0].id}`}>
            {defaultContent.sequences[0].title}
          </Link>
        </li>
      )}
      {unitId && (
        <li>
          <Link to={`/course/${courseId}/${sequenceId}/${unitId}`}>
            {/* Assuming `unitTitle` is part of `unitId`'s data object, you need to fetch it appropriately */}
            {unitId}  
          </Link>
        </li>
      )}
    </>
  );
}

CourseBreadcrumb.propTypes = {
  content: PropTypes.arrayOf(
    PropTypes.shape({
      default: PropTypes.bool,
      id: PropTypes.string,
      label: PropTypes.string,
    }),
  ).isRequired,
  sequenceId: PropTypes.string,
  unitId: PropTypes.string,
  withSeparator: PropTypes.bool,
  courseId: PropTypes.string,
  isStaff: PropTypes.bool,
};

CourseBreadcrumb.defaultProps = {
  withSeparator: false,
  sequenceId: null,
  unitId: null,
  courseId: null,
  isStaff: null,
};

export default function CourseBreadcrumbs({
  courseId,
  sectionId,
  sequenceId,
  unitId,
  isStaff,
}) {
  const course = useModel('coursewareMeta', courseId);
  const courseStatus = useSelector(state => state.courseware.courseStatus);
  const sequenceStatus = useSelector(state => state.courseware.sequenceStatus);

  const allSequencesInSections = Object.fromEntries(useModels('sections', course.sectionIds).map(section => [section.id, {
    default: section.id === sectionId,
    title: section.title,
    sequences: useModels('sequences', section.sequenceIds),
    units: useModels('units', section.unitIds), // Ensure you handle fetching of unitIds properly
  }]));

  const links = useMemo(() => {
    const chapters = [];
    const sequentials = [];
    const units = []; // New array to hold unit links
    if (courseStatus === 'loaded' && sequenceStatus === 'loaded') {
      Object.entries(allSequencesInSections).forEach(([sectionId, section]) => {
        chapters.push({
          id: sectionId,
          label: section.title,
          default: section.default,
          sequences: section.sequences,
        });
        if (section.default) {
          section.sequences.forEach(sequence => {
            sequentials.push({
              id: sequence.id,
              label: sequence.title,
              default: sequence.id === sequenceId,
              sequences: sequence.units, // Adjust to handle units
            });
            sequence.units.forEach(unit => { // Loop through units and prepare unit-specific links
              units.push({
                id: unit.id,
                label: unit.title,
                default: unit.id === unitId,
              });
            });
          });
        }
      });
    }
    return [chapters, sequentials, units]; // Return units in the breadcrumb data
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
        {links.map(content => (
          <CourseBreadcrumb
            courseId={courseId}
            sequenceId={sequenceId}
            content={content}
            unitId={unitId}
            withSeparator
            isStaff={isStaff}
          />
        ))}
      </ol>
    </nav>
  );
}

CourseBreadcrumbs.propTypes = {
  courseId: PropTypes.string.isRequired,
  sectionId: PropTypes.string,
  sequenceId: PropTypes.string,
  unitId: PropTypes.string,
  isStaff: PropTypes.bool,
};

CourseBreadcrumbs.defaultProps = {
  sectionId: null,
  sequenceId: null,
  unitId: null,
  isStaff: null,
};
