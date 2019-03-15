/* @flow */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Option from '../../../components/Option';
import Spinner from '../../../components/Spinner';
import './styles.css';

class LayoutComponent extends Component {
  static propTypes: Object = {
    expanded: PropTypes.bool,
    onExpandEvent: PropTypes.func,
    doCollapse: PropTypes.func,
    onChange: PropTypes.func,
    config: PropTypes.object,
    translations: PropTypes.object,
  };

  state: Object = {
    videoSrc: '',
    dragEnter: false,
    uploadHighlighted: this.props.config.uploadEnabled && !!this.props.config.uploadCallback,
    showVideoLoading: false,
    height: this.props.config.defaultSize.height,
    width: this.props.config.defaultSize.width,
  };

  componentWillReceiveProps(props: Object): void {
    if (this.props.expanded && !props.expanded) {
      this.setState({
        videoSrc: '',
        dragEnter: false,
        uploadHighlighted: this.props.config.uploadEnabled && !!this.props.config.uploadCallback,
        showVideoLoading: false,
        height: this.props.config.defaultSize.height,
        width: this.props.config.defaultSize.width,
      });
    } else if (props.config.uploadCallback !== this.props.config.uploadCallback ||
      props.config.uploadEnabled !== this.props.config.uploadEnabled) {
      this.setState({
        uploadHighlighted: props.config.uploadEnabled && !!props.config.uploadCallback,
      });
    }
  }

  onDragEnter: Function = (event: Object): void => {
    this.stopPropagation(event);
    this.setState({
      dragEnter: true,
    });
  };

  onVideoDrop: Function = (event: Object): void => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({
      dragEnter: false,
    });

    // Check if property name is files or items
    // IE uses 'files' instead of 'items'
    let data;
    let dataIsItems;
    if (event.dataTransfer.items) {
      data = event.dataTransfer.items;
      dataIsItems = true;
    } else {
      data = event.dataTransfer.files;
      dataIsItems = false;
    }
    for (let i = 0; i < data.length; i += 1) {
      if ((!dataIsItems || data[i].kind === 'file') && data[i].type.match('^video/')) {
        const file = dataIsItems ? data[i].getAsFile() : data[i];
        this.uploadVideo(file);
      }
    }
  };

  showVideoUploadOption: Function = (): void => {
    this.setState({
      uploadHighlighted: true,
    });
  };

  addVideoFromState: Function = (): void => {
    const { videoSrc, alt } = this.state;
    let { height, width } = this.state;
    const { onChange } = this.props;
    if (!isNaN(height)) {
      height += 'px';
    }
    if (!isNaN(width)) {
      width += 'px';
    }
    onChange(videoSrc, height, width, alt);
  };

  showVideoURLOption: Function = (): void => {
    this.setState({
      uploadHighlighted: false,
    });
  };

  toggleShowVideoLoading: Function = (): void => {
    const showVideoLoading = !this.state.showVideoLoading;
    this.setState({
      showVideoLoading,
    });
  };

  updateValue: Function = (event: Object): void => {
    this.setState({
      [`${event.target.name}`]: event.target.value,
    });
  };

  selectVideo: Function = (event: Object): void => {
    if (event.target.files && event.target.files.length > 0) {
      this.uploadVideo(event.target.files[0]);
    }
  };

  uploadVideo: Function = (file: Object): void => {
    this.toggleShowVideoLoading();
    const { uploadCallback } = this.props.config;
    uploadCallback(file)
      .then(({ data }) => {
        this.setState({
          showVideoLoading: false,
          dragEnter: false,
          videoSrc: data.link || data.url,
        });
        this.fileUpload = false;
      }).catch(() => {
        this.setState({
          showVideoLoading: false,
          dragEnter: false,
        });
      });
  };

  fileUploadClick = (event) => {
    this.fileUpload = true;
    event.stopPropagation();
  }

  stopPropagation: Function = (event: Object): void => {
    if (!this.fileUpload) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      this.fileUpload = false;
    }
  };

  renderAddVideoModal(): Object {
    const {
      videoSrc,
      uploadHighlighted,
      showVideoLoading,
      dragEnter,
      height,
      width,
      alt,
    } = this.state;
    const {
      config: {
        popupClassName,
        uploadCallback,
        uploadEnabled,
        urlEnabled,
        previewVideo,
        inputAccept,
        alt: altConf,
      },
      doCollapse,
      translations,
    } = this.props;
    return (
      <div
        className={classNames('rdw-image-modal rdw-video-modal', popupClassName)}
        onClick={this.stopPropagation}
      >
        <div className="rdw-image-modal-header">
          {uploadEnabled && uploadCallback &&
            <span
              onClick={this.showVideoUploadOption}
              className="rdw-image-modal-header-option"
            >
              {translations['components.controls.video.fileUpload']}
              <span
                className={classNames(
                  'rdw-image-modal-header-label',
                  { 'rdw-image-modal-header-label-highlighted': uploadHighlighted },
                )}
              />
            </span>}
          { urlEnabled &&
            <span
              onClick={this.showVideoURLOption}
              className="rdw-image-modal-header-option"
            >
              {translations['components.controls.video.byURL']}
              <span
                className={classNames(
                  'rdw-image-modal-header-label',
                  { 'rdw-image-modal-header-label-highlighted': !uploadHighlighted },
                )}
              />
            </span>}
        </div>
        {
          uploadHighlighted ?
            <div onClick={this.fileUploadClick}>
              <div
                onDragEnter={this.onDragEnter}
                onDragOver={this.stopPropagation}
                onDrop={this.onVideoDrop}
                className={classNames(
                  'rdw-image-modal-upload-option',
                  { 'rdw-image-modal-upload-option-highlighted': dragEnter })}
              >
                <label
                  htmlFor="file"
                  className="rdw-image-modal-upload-option-label"
                >
                  { previewVideo && videoSrc
                    ?  (
                      <video
                        className="rdw-image-modal-upload-option-image-preview"
                      >
                        <source src={videoSrc} />
                      </video>
                    )
                    : videoSrc || translations['components.controls.video.dropFileText']}
                </label>
              </div>
              <input
                type="file"
                id="file"
                accept={inputAccept}
                onChange={this.selectVideo}
                className="rdw-image-modal-upload-option-input"
              />
            </div> :
            <div className="rdw-image-modal-url-section">
              <input
                className="rdw-image-modal-url-input"
                placeholder={translations['components.controls.video.enterlink']}
                name="videoSrc"
                onChange={this.updateValue}
                onBlur={this.updateValue}
                value={videoSrc}
              />
              <span className="rdw-image-mandatory-sign">*</span>
            </div>
        }
        <div className="rdw-image-modal-size">
          &#8597;&nbsp;
          <input
            onChange={this.updateValue}
            onBlur={this.updateValue}
            value={height}
            name="height"
            className="rdw-image-modal-size-input"
            placeholder="Height"
          />
          <span className="rdw-image-mandatory-sign">*</span>
          &nbsp;&#8596;&nbsp;
          <input
            onChange={this.updateValue}
            onBlur={this.updateValue}
            value={width}
            name="width"
            className="rdw-image-modal-size-input"
            placeholder="Width"
          />
          <span className="rdw-image-mandatory-sign">*</span>
        </div>
        <span className="rdw-image-modal-btn-section">
          <button
            className="rdw-image-modal-btn"
            onClick={this.addVideoFromState}
            disabled={!videoSrc || !height || !width}
          >
            {translations['generic.add']}
          </button>
          <button
            className="rdw-image-modal-btn"
            onClick={doCollapse}
          >
            {translations['generic.cancel']}
          </button>
        </span>
        {showVideoLoading ?
          <div className="rdw-image-modal-spinner">
            <Spinner />
          </div> :
          undefined}
      </div>
    );
  }

  render(): Object {
    const {
      config: { icon, className, title },
      expanded,
      onExpandEvent,
      translations,
    } = this.props;
    return (
      <div
        className="rdw-image-wrapper"
        aria-haspopup="true"
        aria-expanded={expanded}
        aria-label="rdw-image-control"
      >
        <Option
          className={classNames(className)}
          value="unordered-list-item"
          onClick={onExpandEvent}
          title={title || translations['components.controls.video.video']}
        >
          <img
            src={icon}
            alt=""
          />
        </Option>
        {expanded ? this.renderAddVideoModal() : undefined}
      </div>
    );
  }
}

export default LayoutComponent;
