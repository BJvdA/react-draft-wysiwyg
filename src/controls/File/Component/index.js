import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Option from '../../../components/Option';
import Spinner from '../../../components/Spinner';

class LayoutComponent extends Component {
  static propTypes = {
    expanded: PropTypes.bool,
    onExpandEvent: PropTypes.func,
    doCollapse: PropTypes.func,
    onChange: PropTypes.func,
    config: PropTypes.object,
    translations: PropTypes.object,
  };

  state = {
    href: '',
    title: '',

    dragEnter: false,
    uploadHighlighted:
      this.props.config.uploadEnabled && !!this.props.config.uploadCallback,
    showImageLoading: false,
    linkTargetOption: this.props.config.defaultTargetOption
  };

  componentWillReceiveProps(props) {
    if (this.props.expanded && !props.expanded) {
      this.setState({
        href: '',
        title: '',

        dragEnter: false,
        uploadHighlighted:
          this.props.config.uploadEnabled && !!this.props.config.uploadCallback,
        showImageLoading: false,
        linkTargetOption: this.props.config.defaultTargetOption
      });
    } else if (
      props.config.uploadCallback !== this.props.config.uploadCallback ||
      props.config.uploadEnabled !== this.props.config.uploadEnabled
    ) {
      this.setState({
        uploadHighlighted:
          props.config.uploadEnabled && !!props.config.uploadCallback
      });
    }
  }

  onDragEnter = event => {
    this.stopPropagation(event);
    this.setState({
      dragEnter: true
    });
  };

  onFileDrop = event => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({
      dragEnter: false
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
      // if ((!dataIsItems || data[i].kind === 'file') && data[i].type.match('^image/')) {
      if (!dataIsItems || data[i].kind === 'file') {
        const file = dataIsItems ? data[i].getAsFile() : data[i];
        this.uploadFile(file);
      }
    }
  };

  showFileUploadOption = () => {
    this.setState({
      uploadHighlighted: true
    });
  };

  addFileFromState = () => {
    const { href, title, linkTargetOption } = this.state;
    const { onChange } = this.props;
    onChange(href, title, linkTargetOption);
  };

  showFileURLOption = () => {
    this.setState({
      uploadHighlighted: false
    });
  };

  toggleShowFileLoading = () => {
    this.setState(prevState => ({
      showImageLoading: !prevState.showImageLoading
    }));
  };

  updateTargetOption: Function = (event: Object): void => {
    this.setState({
      linkTargetOption: event.target.checked ? '_blank' : '_self',
    });
  };

  updateValue = event => {
    this.setState({
      [`${event.target.name}`]: event.target.value
    });
  };

  selectFile = event => {
    if (event.target.files && event.target.files.length > 0) {
      this.uploadFile(event.target.files[0]);
    }
  };

  uploadFile = file => {
    this.toggleShowFileLoading();
    const { uploadCallback } = this.props.config;
    uploadCallback(file)
      .then(({ data }) => {
        this.setState({
          showFileLoading: false,
          dragEnter: false,
          href: data.link
        });
        this.fileUpload = false;
      })
      .catch(() => {
        this.setState({
          showFileLoading: false,
          dragEnter: false
        });
      });
  };

  fileUploadClick = event => {
    this.fileUpload = true;
    event.stopPropagation();
  };

  stopPropagation = event => {
    if (!this.fileUpload) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      this.fileUpload = false;
    }
  };

  renderAddFileModal() {
    const {
      href,
      title,
      uploadHighlighted,
      showFileLoading,
      linkTargetOption,
      dragEnter
    } = this.state;
    const {
      config: {
        popupClassName,
        uploadCallback,
        uploadEnabled,
        urlEnabled,
        inputAccept
      },
      doCollapse,
      translations
    } = this.props;
    const altConf = { present: true, mandatory: true }; // FIXME
    return (
      <div
        className={classNames('rdw-image-modal', popupClassName)}
        onClick={this.stopPropagation}
      >
        <div className="rdw-image-modal-header">
          <span
            onClick={this.showFileUploadOption}
            className="rdw-image-modal-header-option"
          >
            {translations['components.controls.image.fileUpload']}
          </span>
        </div>
        <div onClick={this.fileUploadClick}>
          <div
            onDragEnter={this.onDragEnter}
            onDragOver={this.stopPropagation}
            onDrop={this.onFileDrop}
            className={classNames('rdw-image-modal-upload-option', {
              'rdw-image-modal-upload-option-highlighted': dragEnter
            })}
          >
            <label
              htmlFor="file"
              className="rdw-image-modal-upload-option-label"
            >
              <span>
                {href || translations['components.controls.image.dropFileText']}
              </span>
            </label>
          </div>
          <input
            type="file"
            id="file"
            accept={inputAccept}
            onChange={this.selectFile}
            className="rdw-image-modal-upload-option-input"
          />
        </div>
        {altConf.present && (
          <div className="rdw-image-modal-size">
            <span className="rdw-image-modal-alt-lbl">Title</span>
            <input
              onChange={this.updateValue}
              onBlur={this.updateValue}
              value={title}
              name="title"
              className="rdw-image-modal-alt-input"
              placeholder="title"
            />
            <span className="rdw-image-mandatory-sign">
              {altConf.mandatory && '*'}
            </span>
          </div>
        )}
        <label className="rdw-link-modal-target-option" htmlFor="openLinkInNewWindow">
          <input
            id="openLinkInNewWindow"
            type="checkbox"
            defaultChecked={linkTargetOption === '_blank'}
            value="_blank"
            onChange={this.updateTargetOption}
          />
          <span>{translations['components.controls.link.linkTargetOption']}</span>
        </label>
        <span className="rdw-image-modal-btn-section">
          <button
            type="button"
            className="rdw-image-modal-btn"
            onClick={this.addFileFromState}
            disabled={!href}
          >
            {translations['generic.add']}
          </button>
          <button
            type="button"
            className="rdw-image-modal-btn"
            onClick={doCollapse}
          >
            {translations['generic.cancel']}
          </button>
        </span>
        {showFileLoading ? (
          <div className="rdw-image-modal-spinner">
            <Spinner />
          </div>
        ) : (
          undefined
        )}
      </div>
    );
  }

  render() {
    const {
      config: { className, title, icon },
      expanded,
      onExpandEvent,
      translations
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
          title={title || translations['components.controls.image.image']}
        >
          <img src={icon} alt="" />
        </Option>
        {expanded ? this.renderAddFileModal() : undefined}
      </div>
    );
  }
}

export default LayoutComponent;
