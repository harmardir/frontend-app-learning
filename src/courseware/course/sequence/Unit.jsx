import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext, ErrorPage } from '@edx/frontend-platform/react';
import { Modal } from '@edx/paragon';
import PropTypes from 'prop-types';
import React, {
  Suspense, useCallback, useContext, useEffect, useLayoutEffect, useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { processEvent } from '../../../course-home/data/thunks';
/** [MM-P2P] Experiment */
import { MMP2PLockPaywall } from '../../../experiments/mm-p2p';
import { useEventListener } from '../../../generic/hooks';
import { useModel } from '../../../generic/model-store';
import PageLoading from '../../../generic/PageLoading';
import { fetchCourse } from '../../data';
import BookmarkButton from '../bookmark/BookmarkButton';
import messages from './messages';

import { useSequenceNavigationMetadata } from './sequence-navigation/hooks';

const HonorCode = React.lazy(() => import('./honor-code'));
const LockPaywall = React.lazy(() => import('./lock-paywall'));

const IFRAME_FEATURE_POLICY = (
  'microphone *; camera *; midi *; geolocation *; encrypted-media *'
);

function useLoadBearingHook(id) {
  const setValue = useState(0)[1];
  useLayoutEffect(() => {
    setValue(currentValue => currentValue + 1);
  }, [id]);
}

export function sendUrlHashToFrame(frame) {
  const { hash } = window.location;
  if (hash) {
    frame.contentWindow.postMessage({ hashName: hash }, `${getConfig().LMS_BASE_URL}`);
  }
}

function Unit({
  courseId,
  format,
  onLoaded,
  id,
  intl,
  mmp2p,
}) {
  const { authenticatedUser } = useContext(AppContext);
  const view = authenticatedUser ? 'student_view' : 'public_view';
  let iframeUrl = `${getConfig().LMS_BASE_URL}/xblock/${id}?show_title=0&show_bookmark_button=0&recheck_access=1&view=${view}`;
  if (format) {
    iframeUrl += `&format=${format}`;
  }

  const [iframeHeight, setIframeHeight] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showError, setShowError] = useState(false);
  const [modalOptions, setModalOptions] = useState({ open: false });
  const [shouldDisplayHonorCode, setShouldDisplayHonorCode] = useState(false);
  const [windowTopOffset, setWindowTopOffset] = useState(null);

  const unit = useModel('units', id);
  const course = useModel('coursewareMeta', courseId);
  const {
    contentTypeGatingEnabled,
    userNeedsIntegritySignature,
  } = course;

  // Fetch the current sequence ID from the course model or similar
  const currentSequenceId = course.currentSequenceId; // Make sure this is the correct way to fetch it

  // Use the updated hook to get dynamic progress data
  const { totalUnits, completedUnits } = useSequenceNavigationMetadata(currentSequenceId, id);

  const dispatch = useDispatch();
  useLoadBearingHook(id);

  useEffect(() => {
    if (userNeedsIntegritySignature && unit.graded) {
      setShouldDisplayHonorCode(true);
    } else {
      setShouldDisplayHonorCode(false);
    }
  }, [userNeedsIntegritySignature]);

  const receiveMessage = useCallback(({ data }) => {
    const {
      type,
      payload,
    } = data;
    if (type === 'plugin.resize') {
      setIframeHeight(payload.height);

      if (windowTopOffset !== null) {
        window.scrollTo(0, Number(windowTopOffset));
      }

      if (!hasLoaded && iframeHeight === 0 && payload.height > 0) {
        setHasLoaded(true);
        if (onLoaded) {
          onLoaded();
        }
      }
    } else if (type === 'plugin.modal') {
      payload.open = true;
      setModalOptions(payload);
    } else if (type === 'plugin.videoFullScreen') {
      setWindowTopOffset(payload.open ? window.scrollY : null);
    } else if (data.offset) {
      window.scrollTo(0, data.offset + document.getElementById('unit-iframe').offsetTop);
    }
  }, [id, setIframeHeight, hasLoaded, iframeHeight, setHasLoaded, onLoaded, setWindowTopOffset, windowTopOffset]);
  
  useEventListener('message', receiveMessage);

  useEffect(() => {
    sendUrlHashToFrame(document.getElementById('unit-iframe'));
  }, [id, setIframeHeight, hasLoaded, iframeHeight, setHasLoaded, onLoaded]);

  return (
    <div className="unit">
      <h1 className="mb-0 h3">{unit.title}</h1>
      <h2 className="sr-only">{intl.formatMessage(messages.headerPlaceholder)}</h2>
      <BookmarkButton
        unitId={unit.id}
        isBookmarked={unit.bookmarked}
        isProcessing={unit.bookmarkedUpdateState === 'loading'}
      />
      { !mmp2p.state.isEnabled && contentTypeGatingEnabled && unit.containsContentTypeGatedContent && (
        <Suspense
          fallback={(
            <PageLoading
              srMessage={intl.formatMessage(messages.loadingLockedContent)}
            />
          )}
        >
          <LockPaywall courseId={courseId} />
        </Suspense>
      )}
      { mmp2p.meta.showLock && (
        <MMP2PLockPaywall options={mmp2p} />
      )}
      {!mmp2p.meta.blockContent && shouldDisplayHonorCode && (
        <Suspense
          fallback={(
            <PageLoading
              srMessage={intl.formatMessage(messages.loadingHonorCode)}
            />
          )}
        >
          <HonorCode courseId={courseId} />
        </Suspense>
      )}
      {!mmp2p.meta.blockContent && !shouldDisplayHonorCode && !hasLoaded && !showError && (
        <PageLoading
          srMessage={intl.formatMessage(messages.loadingSequence)}
        />
      )}
      {!mmp2p.meta.blockContent && !shouldDisplayHonorCode && !hasLoaded && showError && (
        <ErrorPage />
      )}
      {modalOptions.open && (
        <Modal
          body={(
            <>
              {modalOptions.body
                ? <div className="unit-modal">{ modalOptions.body }</div>
                : (
                  <iframe
                    title={modalOptions.title}
                    allow={IFRAME_FEATURE_POLICY}
                    frameBorder="0"
                    src={modalOptions.url}
                    style={{
                      width: '100%',
                      height: '100vh',
                    }}
                  />
                )}
            </>
          )}
          onClose={() => { setModalOptions({ open: false }); }}
          open
          dialogClassName="modal-lti"
        />
      )}
      { !mmp2p.meta.blockContent && !shouldDisplayHonorCode && (

          <div className="unit-iframe-wrapper">
            <iframe
              id="unit-iframe"
              title={unit.title}
              src={iframeUrl}
              allow={IFRAME_FEATURE_POLICY}
              allowFullScreen
              height={iframeHeight}
              scrolling="no"
              referrerPolicy="origin"
              onLoad={() => {
                if (!hasLoaded) {
                  setShowError(true);
                }
                window.onmessage = (e) => {
                  if (e.data.event_name) {
                    dispatch(processEvent(e.data, fetchCourse));
                  }
                };
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

Unit.propTypes = {
  courseId: PropTypes.string.isRequired,
  format: PropTypes.string,
  id: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  onLoaded: PropTypes.func,
  mmp2p: PropTypes.shape({
    state: PropTypes.shape({
      isEnabled: PropTypes.bool.isRequired,
    }),
    meta: PropTypes.shape({
      showLock: PropTypes.bool,
      blockContent: PropTypes.bool,
    }),
  }),
};

Unit.defaultProps = {
  format: null,
  onLoaded: undefined,
  mmp2p: {
    state: {
      isEnabled: false,
    },
    meta: {
      showLock: false,
      blockContent: false,
    },
  },
};

export default injectIntl(Unit);
