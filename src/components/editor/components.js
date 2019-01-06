import React from 'react'
import styled from '@emotion/styled'

// Toolbar icons
import FormatBold from '@material-ui/icons/FormatBold';
import FormatItalic from '@material-ui/icons/FormatItalic';
import FormatUnderlined from '@material-ui/icons/FormatUnderlined';
import Code from '@material-ui/icons/Code';
import LooksOne from '@material-ui/icons/LooksOne';
import LooksTwo from '@material-ui/icons/LooksTwo';
import FormatQuote from '@material-ui/icons/FormatQuote';
import FormatListNumbered from '@material-ui/icons/FormatListNumbered';
import FormatListBulleted from '@material-ui/icons/FormatListBulleted';
import ImageIcon from '@material-ui/icons/Image';
import Add from '@material-ui/icons/Add';

export const Button = styled('span')`
  cursor: pointer;
  color: ${props =>
    props.reversed
      ? props.active ? 'white' : '#aaa'
      : props.active ? 'black' : '#ccc'};
`

export const Image = styled('img')`
  display: block;
  max-width: 100%;
  max-height: 20em;
  box-shadow: ${props => (props.selected ? '0 0 0 2px blue;' : 'none')};
`

export const Icon = (icon) => {
  switch (icon.icon) {
    case 'format_bold':
      return <FormatBold />
    case 'format_italic':
      return <FormatItalic />
    case 'format_underlined':
      return <FormatUnderlined />
    case 'code':
      return <Code />
    case 'looks_one':
      return <LooksOne />
    case 'looks_two':
      return <LooksTwo />
    case 'format_quote':
      return <FormatQuote />
    case 'format_list_numbered':
      return <FormatListNumbered />
    case 'format_list_bulleted':
      return <FormatListBulleted />
    case 'image':
      return <ImageIcon />
    default:
      return <Add />
    }
};

export const Menu = styled('div')`
  & > * {
    display: inline-block;
  }

  & > * + * {
    margin-left: 15px;
  }
`

export const Toolbar = styled(Menu)`
  position: relative;
  padding: 1px 18px 17px;
  margin: 0 -20px;
  border-bottom: 2px solid #eee;
  margin-bottom: 20px;
`
