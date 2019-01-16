import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { EditorState, Modifier } from 'draft-js';
import { last } from 'lodash';

import LayoutComponent from './Component';

class FileControl extends Component {
  static propTypes = {
    editorState: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    modalHandler: PropTypes.object,
    config: PropTypes.object,
    translations: PropTypes.object,
  };

  state = {
    expanded: false
  };

  componentWillMount() {
    const { modalHandler } = this.props;
    modalHandler.registerCallBack(this.expandCollapse);
  }

  componentWillUnmount() {
    const { modalHandler } = this.props;
    modalHandler.deregisterCallBack(this.expandCollapse);
  }

  onExpandEvent = () => {
    this.signalExpanded = !this.state.expanded;
  };

  doExpand = () => {
    this.setState({
      expanded: true
    });
  };

  doCollapse = () => {
    this.setState({
      expanded: false
    });
  };

  expandCollapse = () => {
    this.setState({
      expanded: this.signalExpanded
    });
    this.signalExpanded = false;
  };

  addFile = url => {
    const { editorState, onChange } = this.props;
    const linkTitle = last(url.split('/'));

    let editor = editorState;
    let content = editor
      .getCurrentContent()
      .createEntity('LINK', 'MUTABLE', { url });
    const entityKey = content.getLastCreatedEntityKey();
    content = Modifier.replaceText(
      content,
      editor.getSelection(),
      linkTitle,
      editor.getCurrentInlineStyle(),
      entityKey
    );
    editor = EditorState.push(editor, content, 'insert-characters');
    onChange(editor);
    this.doCollapse();
  };

  render() {
    const { config, translations } = this.props;
    const { expanded } = this.state;

    return (
      <LayoutComponent
        config={config}
        translations={translations}
        onChange={this.addFile}
        expanded={expanded}
        onExpandEvent={this.onExpandEvent}
        doExpand={this.doExpand}
        doCollapse={this.doCollapse}
      />
    );
  }
}

export default FileControl;
