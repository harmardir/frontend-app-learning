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

import { Collapsible, Icon, IconButton } from '@openedx/paragon';
import { Block } from '@openedx/paragon/icons';
import { useModel } from '../../generic/model-store';
import messages from './messages';
import genericMessages from '../../generic/messages';
import UnitLink from './UnitLink';
import { getSequenceMetadata } from '../../courseware/data/api';

const SequenceLink = ({
  id,
  intl,
  courseId,
  first,
  sequence,
}) => {
  const {
    complete,
    description,
    due,
    showLink,
    title,
    hideFromTOC,
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
  // return (
  //   <li>
  //     <div className={classNames('', { 'mt-2 pt-2 border-top border-light': !first })}>
  //       <div className="row w-100 m-0">
  //         <div className="col-auto p-0">
  //           {complete ? (
  //             <FontAwesomeIcon
  //               icon={fasCheckCircle}
  //               fixedWidth
  //               className="float-left text-success mt-1"
  //               aria-hidden={complete}
  //               title={intl.formatMessage(messages.completedAssignment)}
  //             />
  //           ) : (
  //             <FontAwesomeIcon
  //               icon={farCheckCircle}
  //               fixedWidth
  //               className="float-left text-gray-400 mt-1"
  //               aria-hidden={complete}
  //               title={intl.formatMessage(messages.incompleteAssignment)}
  //             />
  //           )}
  //         </div>
  //         <div className="col-10 p-0 ml-3 text-break">
  //           <span className="align-middle">{displayTitle}</span>
  //           <span className="sr-only">
  //             , {intl.formatMessage(complete ? messages.completedAssignment : messages.incompleteAssignment)}
  //           </span>
  //           <EffortEstimate className="ml-3 align-middle" block={sequence} />
  //         </div>
  //       </div>
  //       {hideFromTOC && (
  //         <div className="row w-100 my-2 mx-4 pl-3">
  //           <span className="small d-flex">
  //             <Icon className="mr-2" src={Block} data-testid="hide-from-toc-sequence-link-icon" />
  //             <span data-testid="hide-from-toc-sequence-link-text">
  //               {intl.formatMessage(messages.hiddenSequenceLink)}
  //             </span>
  //           </span>
  //         </div>
  //       )}
  //       <div className="row w-100 m-0 ml-3 pl-3">
  //         <small className="text-body pl-2">
  //           {due ? dueDateMessage : noDueDateMessage}
  //         </small>
  //       </div>
  //     </div>
  //   </li>
  // );
  return (
    <li>
      <Collapsible
        className="mb-2"
        styling="card-lg"
        title={sequenceTitle}
        open={open}
        onToggle={() => { setOpen(!open); }}
        iconWhenClosed={(
          <IconButton
            alt={intl.formatMessage(messages.openSection)}
            icon={faPlus}
            onClick={() => { setOpen(true); }}
            size="sm"
          />
        )}
        iconWhenOpen={(
          <IconButton
            alt={intl.formatMessage(genericMessages.close)}
            icon={faMinus}
            onClick={() => { setOpen(false); }}
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
};

SequenceLink.propTypes = {
  id: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
  first: PropTypes.bool.isRequired,
  sequence: PropTypes.shape().isRequired,
};

export default injectIntl(SequenceLink);
