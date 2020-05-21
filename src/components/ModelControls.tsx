import React from 'react';
import Button from 'react-bootstrap/Button';
import '../App.scss';
import AnimatePanel, { RobotValue } from './AnimatePanel';
import { ControlConfig } from './constants';
import ValueSlider from './ValueSlider';
interface Props {
  updateConfig(index: number, value: number): void;
  updateAxis(value: boolean): void;
  updateLabel(value: boolean): void;
  resetPosition(): void;
  receiveRobotValues(): number[];
  getPositionList(robotValues: RobotValue[]): void;
  getEndEffectorYcor(): number;
  effectorIntersect(): boolean;
}
interface Position {
  x: number;
  y: number;
}
interface State {
  pos: Position;
  portraitPos: Position;
  landscapePos: Position;
  dragging: boolean;
  rel: Position;
  backgroundColor: string;
  width: string | number;
  height: string | number;
  overflow: string;
  showControls: boolean;
  showAxes: boolean;
  showLabels: boolean;
  robotValues: number[];
}
interface Config {
  label: string;
  defaultVal: number;
  max: number;
  min: number;
  valUnit: string;
}

const defaultBackground = '#222831da';
const backgroundHover = '#222831a0';

class ModelControls extends React.Component<Props, State> {
  containerRef: React.RefObject<HTMLDivElement>;
  longPressTimeout: any;
  onMobile: boolean;
  constructor(props: any) {
    super(props);
    this.containerRef = React.createRef<HTMLDivElement>();
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      )
    ) {
      this.onMobile = true;
    } else this.onMobile = false;
    // Set initial position on controls panel
    const { innerHeight } = window;
    this.state = {
      dragging: false,
      pos: { x: 0, y: 0 },
      portraitPos: { x: 0, y: innerHeight * 0.55 },
      landscapePos: { x: innerHeight * 0.55, y: 0 },
      rel: { x: 0, y: 0 },
      backgroundColor: defaultBackground,
      width: '35%',
      height: '100%',
      overflow: 'auto',
      showAxes: true,
      showControls: true,
      showLabels: true,
      robotValues: [0, 0, 0, 0, 0],
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeControls, false);

    if (this.onMobile) {
      this.resizeControls();
    }
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeControls);
  }

  resizeControls = () => {
    const isPortrait = window.matchMedia('(orientation: portrait)').matches;
    if (this.onMobile) {
      // Update position of the controls div based on orientation
      this.setState({
        pos: isPortrait ? this.state.portraitPos : this.state.landscapePos,
        backgroundColor: defaultBackground,
        width: isPortrait ? '100%' : '45%',
        height: isPortrait ? '45%' : '100%',
      });
      window.scrollTo(0, 0);
    } else {
      if (this.containerRef.current) {
        // get width of the controls div and left position
        const { offsetWidth, offsetLeft } = this.containerRef.current;
        const { innerWidth } = window;
        const xDelta = innerWidth - offsetWidth;

        // Push the controls div left as window gets smaller
        this.setState({
          pos: {
            x: offsetLeft >= xDelta ? xDelta : offsetLeft,
            y: 0,
          },
          backgroundColor: defaultBackground,
        });
      }
    }
  };
  onMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (event.button !== 0) return;
    const top = event.currentTarget.offsetTop;
    const left = event.currentTarget.offsetLeft;
    const { pageX, pageY } = event;
    const newPosition = {
      x: pageX - left,
      y: pageY - top,
    };
    event.currentTarget.style.cursor = 'move';
    this.setState({
      dragging: true,
      rel: newPosition,
      backgroundColor: backgroundHover,
    });
    event.stopPropagation();
  };
  onMouseUp = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.currentTarget.style.cursor = 'auto';
    this.setState({ dragging: false, backgroundColor: defaultBackground });
    event.stopPropagation();
  };
  onMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!this.state.dragging) return;

    const { innerHeight, innerWidth } = window;
    const { offsetWidth, offsetHeight } = event.currentTarget;

    let newX = event.pageX - this.state.rel.x;
    let newY = event.pageY - this.state.rel.y;

    // Check for the div to be within the viewport
    if (newX < 0) newX = 0;
    else if (newX > innerWidth - offsetWidth) newX = innerWidth - offsetWidth;
    if (newY < 0) newY = 0;
    else if (newY > innerHeight - offsetHeight)
      newY = innerHeight - offsetHeight;

    // Update the position of the div
    this.setState({
      pos: {
        x: newX,
        y: newY,
      },
    });

    event.stopPropagation();
  };
  onMouseLeave = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.currentTarget.style.cursor = 'auto';
    this.setState({ dragging: false, backgroundColor: defaultBackground });
    event.stopPropagation();
  };
  onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const top = event.currentTarget.offsetTop;
    const left = event.currentTarget.offsetLeft;
    const { pageX, pageY } = event.touches[0];
    this.longPressTimeout = setTimeout(() => {
      this.setState({
        dragging: true,
        rel: {
          x: pageX - left,
          y: pageY - top,
        },
        backgroundColor: backgroundHover,
        overflow: 'hidden',
      });
    }, 300);
    event.stopPropagation();
  };
  onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const isPortrait = window.matchMedia('(orientation: portrait)').matches;
    if (isPortrait) {
      this.setState({
        dragging: false,
        backgroundColor: defaultBackground,
        portraitPos: this.state.pos,
        overflow: 'auto',
      });
    } else {
      this.setState({
        dragging: false,
        backgroundColor: defaultBackground,
        landscapePos: this.state.pos,
        overflow: 'auto',
      });
    }

    event.stopPropagation();
  };
  onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!this.state.dragging) {
      clearTimeout(this.longPressTimeout);
      return;
    }
    const { pageX, pageY } = event.touches[0];
    const { innerHeight, innerWidth } = window;
    const { offsetWidth, offsetHeight } = event.currentTarget;

    let newX = pageX - this.state.rel.x;
    let newY = pageY - this.state.rel.y;
    if (newX < 0) newX = 0;
    else if (newX > innerWidth - offsetWidth) newX = innerWidth - offsetWidth;
    if (newY < 0) newY = 0;
    else if (newY > innerHeight - offsetHeight)
      newY = innerHeight - offsetHeight;
    this.setState({
      pos: {
        x: newX,
        y: newY,
      },
    });
    event.stopPropagation();
  };
  onControlsButton = (
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.TouchEvent<HTMLButtonElement>,
  ) => {
    this.setState({ showControls: !this.state.showControls });
    event.currentTarget.blur();
    event.stopPropagation();
    event.preventDefault();
  };
  onAxesButton = (
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.TouchEvent<HTMLButtonElement>,
  ) => {
    event.currentTarget.blur();
    const axes = !this.state.showAxes;
    this.props.updateAxis(axes);
    this.setState({ showAxes: axes });
    event.stopPropagation();
  };
  onClickLabel = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.currentTarget.blur();
    const label = !this.state.showLabels;
    this.setState({ showLabels: label });
    this.props.updateLabel(label);
    event.stopPropagation();
  };
  showControls = (
    event:
      | React.TouchEvent<HTMLDivElement>
      | React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    this.setState({
      showControls: true,
      backgroundColor: defaultBackground,
    });
    event.stopPropagation();
  };
  // written to prevent event propagatiion
  stopPropagation = (
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.TouchEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
  };
  pressShowControls = (event: React.TouchEvent<HTMLDivElement>) => {
    console.log('button event start');
    this.setState({ backgroundColor: backgroundHover });
    event.stopPropagation();
  };
  updateArmConfig = (index: number, value: number): void => {
    const config = this.state.robotValues.slice();
    config[index] = value;
    this.setState({ robotValues: config });
    this.props.updateConfig(index, value);
  };
  renderSlider = (config: Config, index: number) => (
    <ValueSlider
      value={this.state.robotValues[index]}
      key={index}
      {...config}
      updateValue={this.updateArmConfig}
      index={index}
      endEffectorYcor={this.props.getEndEffectorYcor}
      effectorIntersect={this.props.effectorIntersect}
    />
  );
  resetPosition = () => {
    this.props.resetPosition();
    this.setState({ robotValues: [0, 0, 0, 0, 0] });
  };
  render() {
    return (
      <div>
        <div
          ref={this.containerRef}
          className="controls disable-selection"
          onMouseDown={this.onMouseDown}
          onMouseMove={this.onMouseMove}
          onMouseUp={this.onMouseUp}
          onMouseLeave={this.onMouseLeave}
          onTouchStart={this.onTouchStart}
          onTouchMove={this.onTouchMove}
          onTouchEnd={this.onTouchEnd}
          unselectable="on"
          style={{
            left: this.state.pos.x + 'px',
            top: this.state.pos.y + 'px',
            width: this.state.width,
            height: this.state.height,
            backgroundColor: this.state.backgroundColor,
            minWidth: this.onMobile ? undefined : 400,
            overflow: this.state.overflow,
            display: this.state.showControls ? 'block' : 'none',
          }}
        >
          <h1>OWI Robot Arm: Controls</h1>
          <p id="text">
            Use the sliders move the associated robot arm joints. Click, touch,
            drag or scroll on the model screen to transform the display. Press
            and hold to drag the panel.
          </p>
          {ControlConfig.map(this.renderSlider)}
          <div className="button-container">
            <Button
              size="lg"
              variant="primary"
              aria-label="First group"
              onClick={this.onControlsButton}
              onMouseUp={this.stopPropagation}
              onTouchEnd={this.stopPropagation}
              onMouseDown={this.stopPropagation}
              onTouchStart={this.stopPropagation}
            >
              Hide Controls
            </Button>

            <Button
              size="lg"
              variant="primary"
              aria-label="Second group"
              onClick={this.onAxesButton}
              onMouseDown={this.stopPropagation}
              onTouchStart={this.stopPropagation}
              onMouseUp={this.stopPropagation}
              onTouchEnd={this.stopPropagation}
            >
              {this.state.showAxes ? 'Hide Axes' : 'Show Axes'}
            </Button>

            <Button
              size="lg"
              variant="primary"
              aria-label="Third group"
              onClick={this.onClickLabel}
              onMouseDown={this.stopPropagation}
              onMouseUp={this.stopPropagation}
              onTouchStart={this.stopPropagation}
              onTouchEnd={this.stopPropagation}
            >
              {this.state.showLabels ? 'Hide Labels' : 'Show Labels'}
            </Button>
          </div>
          <AnimatePanel
            resetPosition={this.resetPosition}
            receiveRobotValues={this.props.receiveRobotValues}
            getPositionList={this.props.getPositionList}
          />
        </div>
        <div
          className={'show-controls disable-selection'}
          style={{
            display: this.state.showControls ? 'none' : 'block',
            backgroundColor: this.state.backgroundColor,
          }}
          onClick={this.showControls}
          onTouchEnd={this.showControls}
          onTouchStart={this.pressShowControls}
        >
          <h4>Show Controls</h4>
        </div>
      </div>
    );
  }
}
export default ModelControls;
