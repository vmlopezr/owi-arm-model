import React, { FunctionComponent, useRef, useState } from 'react';
import { ChevronIcon } from './ChevronIcon';
import { AccordionProps } from './constants';
import './styles/AngleAccordion.scss';

const stopPropagation = (
  event:
    | React.MouseEvent<HTMLButtonElement, MouseEvent>
    | React.TouchEvent<HTMLButtonElement>,
) => {
  event.stopPropagation();
};

export const AngleAccordion: FunctionComponent<AccordionProps> = React.memo(
  (props: AccordionProps) => {
    const [setActive, setActiveState] = useState('');
    const [setHeight, setHeightState] = useState('0px');
    const [setRotate, setRotateState] = useState('accordion__icon');
    const [setSelected, setSelectedState] = useState('');
    const content = useRef<HTMLDivElement>(null);
    // Show the accordion on active state
    const toggleAccordion = () => {
      setActiveState(setActive === '' ? 'active' : '');
      setHeightState(
        setActive === 'active' ? '0px' : `${content.current?.scrollHeight}px`,
      );
      setRotateState(
        setActive === 'active' ? 'accordion__icon' : 'accordion__icon rotate',
      );
    };
    /* Select the accordion object and update color. This state is used, with the
    select state, and will be used to delete items. By the parent component     */
    const selectItem = (
      event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ) => {
      setHeightState('0px');

      if (setSelected !== 'selected-item') {
        props.selectItem(props.index);
        setSelectedState('selected-item');
      } else {
        props.deSelectItem(props.index);
        setSelectedState('');
      }
      event.preventDefault();
      event.stopPropagation();
    };

    // Reset the active, selected, rotation and height state on prop changes
    React.useEffect(() => {
      if (!props.onSelect) {
        setActiveState('');
        setSelectedState('');
        setRotateState('accordion__icon');
        setHeightState('0px');
      }
    }, [props.onSelect]);

    return (
      <div className="accordion__section">
        <button
          className={
            props.onSelect
              ? `accordion ${setSelected}`
              : `accordion ${setActive}`
          }
          onClick={props.onSelect ? selectItem : toggleAccordion}
          onTouchStart={stopPropagation}
          onTouchEnd={stopPropagation}
          onMouseDown={stopPropagation}
          onMouseUp={stopPropagation}
        >
          {props.children.header}
          <ChevronIcon
            className={props.onSelect ? 'accordion__icon' : `${setRotate}`}
            width={15}
            height={15}
            fill={'#777'}
          />
        </button>
        <div
          ref={content}
          className="accordion__content"
          style={{ maxHeight: props.onSelect ? '0px' : setHeight }}
        >
          <div className="accordion__text">{props.children.body}</div>
        </div>
      </div>
    );
  },
);
