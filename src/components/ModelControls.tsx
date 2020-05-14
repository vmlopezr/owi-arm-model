import React from 'react';
import ValueSlider from './ValueSlider';

interface Props {
  updateConfig(index: number, value: number): void;
}
interface Position {
  x: number;
  y: number;
}
interface State {
  pos: Position;
  dragging: boolean;
  rel: Position;
  backgroundColor: string;
}
const controlConfig = [
  {
    label: 'Joint 1',
    defaultVal: 0,
    max: 135,
    min: -135,
    valUnit: '\u00b0',
  },
  {
    label: 'Joint 2',
    defaultVal: 0,
    max: 85,
    min: -85,
    valUnit: '\u00b0',
  },
  {
    label: 'Joint 3',
    defaultVal: 0,
    max: 135,
    min: -135,
    valUnit: '\u00b0',
  },
  {
    label: 'Joint 4',
    defaultVal: 0,
    max: 60,
    min: -60,
    valUnit: '\u00b0',
  },
  { label: 'Gripper', defaultVal: 50, max: 100, min: 0, valUnit: '%' },
];
class ModelControls extends React.PureComponent<Props, State> {
  containerRef: React.RefObject<HTMLDivElement>;
  longPressTimeout: any;
  constructor(props: any) {
    super(props);
    this.containerRef = React.createRef<HTMLDivElement>();
    this.state = {
      dragging: false,
      pos: { x: 0, y: 0 },
      rel: { x: 0, y: 0 },
      backgroundColor: '#66616888',
    };
  }
  onMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (event.button !== 0) return;
    console.log('click start');
    const top = event.currentTarget.offsetTop;
    const left = event.currentTarget.offsetLeft;
    const { pageX, pageY } = event;
    event.currentTarget.style.cursor = 'move';
    this.setState({
      dragging: true,
      rel: {
        x: pageX - left,
        y: pageY - top,
      },
      backgroundColor: '#ebd9f388',
    });
    event.stopPropagation();
    event.preventDefault();
  };
  onMouseUp = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.currentTarget.style.cursor = 'auto';
    this.setState({ dragging: false, backgroundColor: '#66616888' });
    event.stopPropagation();
    event.preventDefault();
  };
  onMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!this.state.dragging) return;

    const { innerHeight, innerWidth } = window;
    const { clientWidth, clientHeight } = event.currentTarget;

    let newX = event.pageX - this.state.rel.x;
    let newY = event.pageY - this.state.rel.y;

    // Check for the div to be within the viewport
    if (newX < 0) newX = 0;
    else if (newX > innerWidth - clientWidth) newX = innerWidth - clientWidth;
    if (newY < 0) newY = 0;
    else if (newY > innerHeight - clientHeight)
      newY = innerHeight - clientHeight;

    // Update the position of the div
    this.setState({
      pos: {
        x: newX,
        y: newY,
      },
    });

    event.stopPropagation();
    event.preventDefault();
  };
  onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    console.log('touch start');
    const top = event.currentTarget.offsetTop;
    const left = event.currentTarget.offsetLeft;
    const { pageX, pageY } = event.touches[0];
    this.longPressTimeout = setTimeout(() => {
      console.log('long press ' + left);
      this.setState({
        dragging: true,
        rel: {
          x: pageX - left,
          y: pageY - top,
        },
        backgroundColor: '#ebd9f388',
      });
    }, 300);
    event.stopPropagation();
    event.preventDefault();
  };
  onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    this.setState({ dragging: false, backgroundColor: '#66616888' });
    event.stopPropagation();
    event.preventDefault();
  };
  onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!this.state.dragging) {
      clearTimeout(this.longPressTimeout);
      return;
    }
    const { pageX, pageY } = event.touches[0];
    const { innerHeight, innerWidth } = window;
    const { clientWidth, clientHeight } = event.currentTarget;

    let newX = pageX - this.state.rel.x;
    let newY = pageY - this.state.rel.y;
    if (newX < 0) newX = 0;
    else if (newX > innerWidth - clientWidth) newX = innerWidth - clientWidth;
    if (newY < 0) newY = 0;
    else if (newY > innerHeight - clientHeight)
      newY = innerHeight - clientHeight;
    this.setState({
      pos: {
        x: newX,
        y: newY,
      },
    });
    event.stopPropagation();
    event.preventDefault();
  };
  render() {
    return (
      <div
        ref={this.containerRef}
        className="controls disable-selection"
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
        onTouchStart={this.onTouchStart}
        onTouchMove={this.onTouchMove}
        onTouchEnd={this.onTouchEnd}
        unselectable="on"
        style={{
          left: this.state.pos.x + 'px',
          top: this.state.pos.y + 'px',
          backgroundColor: this.state.backgroundColor,
        }}
      >
        <h1 style={{ pointerEvents: 'none' }}>Arm Controls</h1>
        <h3 style={{ pointerEvents: 'none' }}>
          {' '}
          Use the sliders to move the owi arm
        </h3>
        {controlConfig.map((config, index) => (
          <ValueSlider
            key={index}
            {...config}
            updateValue={this.props.updateConfig}
            index={index}
          />
        ))}
      </div>
    );
  }
}
export default ModelControls;
