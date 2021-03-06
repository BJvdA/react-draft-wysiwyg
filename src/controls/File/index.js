import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { EditorState, Modifier } from 'draft-js';
import { last } from 'lodash';
import { getSelectionText } from 'draftjs-utils';

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

  getCurrentValues = () => {
    const { editorState } = this.props;
    const currentValues = {};
    currentValues.selectionText = getSelectionText(editorState);
    return currentValues;
  }

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

  addFile = (url, linkTitleParam, linkTargetOption) => {
    const { editorState, onChange } = this.props;
    const linkTitle = linkTitleParam || last(url.split('/'));

    let editor = editorState;
    let content = editor
      .getCurrentContent()
      .createEntity('LINK', 'MUTABLE', { url, targetOption: linkTargetOption });
    const entityKey = content.getLastCreatedEntityKey();
    content = Modifier.replaceText(
      content,
      editor.getSelection(),
      linkTitle,
      editor.getCurrentInlineStyle(),
      entityKey
    );
    // Insert space after link
    // editor = EditorState.push(editor, content, 'insert-characters');
    // content = Modifier.insertText(
    //   content,
    //   editor.getSelection(),
    //   ' ',
    //   editor.getCurrentInlineStyle(),
    //   undefined,
    // );
    onChange(EditorState.push(editor, content, 'insert-characters'));
    this.doCollapse();
  };

  render() {
    const { config, translations } = this.props;
    const { expanded } = this.state;
    const { selectionText } = this.getCurrentValues();

    return (
      <LayoutComponent
        config={config}
        translations={translations}
        onChange={this.addFile}
        expanded={expanded}
        onExpandEvent={this.onExpandEvent}
        doExpand={this.doExpand}
        doCollapse={this.doCollapse}
        currentState={{
          selectionText
        }}
      />
    );
  }
}

export default FileControl;
