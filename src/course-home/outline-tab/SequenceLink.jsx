import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  FormattedMessage,
  FormattedTime,
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';
import { faMinus, faPlus, faCheckCircle as fasCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle as farCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import EffortEstimate from '../../shared/effort-estimate';
import { Collapsible, Icon, IconButton } from '@edx/paragon';
import { Block } from '@edx/paragon/icons';
import { useModel } from '../../generic/model-store';
import messages from './messages';
import genericMessages from '../../generic/messages';
import UnitLink from './UnitLink';
import { getSequenceMetadata } from '../../courseware/data/api';

function SequenceLink({
  id,
  intl,
  courseId,
  first,
  sequence,
  hideFromTOC, // Add hideFromTOC prop here
  expand,
}) {
  const {
    complete,
    description,
    due,
    showLink,
    title,
  } = sequence;
  const {
    userTimezone,
  } = useModel('outline', courseId);

  const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};

  const coursewareUrl = <Link to={`/course/${courseId}/${id}`}>{title}</Link>;
  const displayTitle = showLink ? coursewareUrl : title;

  const [unitData, setUnitData] = useState();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const units = await getSequenceMetadata(id);
      setUnitData(units);
    };
    getData();
  }, []);

  useEffect(() => {
    setOpen(expand);
  }, [expand]);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };


  const sequenceTitle = (
    <div className="d-flex row w-100 m-0">
      <div className="col-auto p-0">
        {complete ? (
          <FontAwesomeIcon
            icon={fasCheckCircle}
            fixedWidth
            className="float-left mt-1 text-success"
            aria-hidden="true"
            title={intl.formatMessage(messages.completedAssignment)}
          />
        ) : (
          <FontAwesomeIcon
            icon={farCheckCircle}
            fixedWidth
            className="float-left mt-1 text-gray-400"
            aria-hidden="true"
            title={intl.formatMessage(messages.incompleteAssignment)}
          />
        )}
      </div>
      <div className="col-7 ml-3 p-0 font-weight-bold text-dark-500">
        <span className="align-middle col-6">{displayTitle}</span>
        <span className="sr-only">
          , {intl.formatMessage(complete ? messages.completedAssignment : messages.incompleteAssignment)}
        </span>
      </div>
      {hideFromTOC && (
        <div className="row w-100 my-2 mx-4 pl-3">
          <span className="small d-flex">
            <Icon className="mr-2" src={Block} data-testid="hide-from-toc-sequence-link-icon" />
            <span data-testid="hide-from-toc-sequence-link-text">
              {intl.formatMessage(messages.hiddenSequenceLink)}
            </span>
          </span>
        </div>
      )}
    </div>
  );
 
  return (
    <li>
      <Collapsible
        className="mb-2"
        styling="card-lg"
        title={sequenceTitle}
        open={open}
        onToggle={handleToggle} // Added this line
        iconWhenClosed={(
          <IconButton
            alt={intl.formatMessage(messages.openSection)}
            icon={faPlus}
            //onClick={() => { setOpen(true); }}
            size="sm"
          />
        )}
        iconWhenOpen={(
          <IconButton
            alt={intl.formatMessage(genericMessages.close)}
            icon={faMinus}
            //onClick={() => { setOpen(false); }}
            size="sm"
          />
        )}
      >
        <ol className="list-unstyled">
          {unitData?.units?.map((unit, index) => (
            <UnitLink
              key={unit.id}
              id={unit.id}
              courseId={courseId}
              unit={unit}
              first={index === 0}
            />
          ))}
        </ol>

      </Collapsible>
    </li>
  );
}

SequenceLink.propTypes = {
  id: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
  first: PropTypes.bool.isRequired,
  sequence: PropTypes.shape().isRequired,
  hideFromTOC: PropTypes.bool, // Add hideFromTOC to propTypes
};

export default injectIntl(SequenceLink);
