import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';

import messages from './messages';
import Tabs from '../generic/tabs/Tabs';

function CourseTabsNavigation({
  activeTabSlug, className, tabs, intl,
}) {

 
  const bannerImageUrl = "https://undp-lms.kashida-learning.co/asset-v1:ACINET+ACINET_A+T2_2024+type@asset+block@course_about.png";
  const bannerAltText = "Course About Banner";


  return (

    <div id="courseTabsNavigation" className={classNames('course-tabs-navigation', className)}>

      {/* Banner Image */}
      <div className="banner-image-wrapper">
        <img src={bannerImageUrl} alt={bannerAltText} className="banner-image" />
      </div>
      
      <div className="container-xl">
        <Tabs
          className="nav-underline-tabs"
          aria-label={intl.formatMessage(messages.courseMaterial)}
        >
          {tabs.map(({ url, title, slug }) => (
            <a
              key={slug}
              className={classNames('nav-item flex-shrink-0 nav-link', { active: slug === activeTabSlug })}
              href={url}
            >
              {title}
            </a>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

CourseTabsNavigation.propTypes = {
  activeTabSlug: PropTypes.string,
  className: PropTypes.string,
  tabs: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  })).isRequired,
  intl: intlShape.isRequired,
};

CourseTabsNavigation.defaultProps = {
  activeTabSlug: undefined,
  className: null,
};

export default injectIntl(CourseTabsNavigation);
