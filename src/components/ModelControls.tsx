import React from 'react';
import Button from 'react-bootstrap/Button';
import '../App.scss';
import AnimatePanel from './AnimatePanel';
import {
  backgroundHover,
  ControlConfig,
  ControlsProps,
  ControlsState,
  defaultBackground,
  RobotValue,
  SliderConfig,
} from './constants';
import ValueSlider from './ValueSlider';

/* Controls panel for the application. This panel can be dragged accros the screen. 
Note that it needs ot keep some flags in the state since the parent component 'ThreeContainer' 
does not rerender. As a result the variables cannot be passed as props.*/
class ModelControls extends React.Component<ControlsProps, ControlsState> {
  containerRef: React.RefObject<HTMLDivElement>;
  longPressTimeout: any;
  onMobile: boolean;
  constructor(props: any) {
    super(props);
    this.containerRef = React.createRef<HTMLDivElement>();
    // Detect whether running on mobile or PC
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
      landscapePos: { x: 0, y: 0 },
      rel: { x: 0, y: 0 },
      backgroundColor: defaultBackground,
      width: '35%',
      height: '100%',
      overflow: 'auto',
      showAxes: true,
      showControls: true,
      showLabels: true,
      animation: false,
      robotValues: [0, 0, 0, 0, 0],
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeControls, false);
    // Resize on Mobile devices
    if (this.onMobile) {
      this.resizeControls();
    }
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeControls);
  }
  /* Call back for resize event */
  resizeControls = () => {
    const isPortrait = window.matchMedia('(orientation: portrait)').matches;
    if (this.onMobile) {
      // Update position of the Controls Panel based on orientation
      this.setState({
        pos: isPortrait ? this.state.portraitPos : this.state.landscapePos,
        backgroundColor: defaultBackground,
        width: isPortrait ? '100%' : '45%',
        height: isPortrait ? '45%' : '100%',
      });
      window.scrollTo(0, 0);
    } else {
      if (this.containerRef.current) {
        // get width of the Controls Panel and left position
        const { offsetWidth, offsetLeft } = this.containerRef.current;
        const { innerWidth } = window;
        const xDelta = innerWidth - offsetWidth;

        // Push the Controls Panel left as window gets smaller
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
  /* Update the color of the Controls Panel to communicate dragging.*/
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
    // Update the background color and set dragging flag to allow movement
    this.setState({
      dragging: true,
      rel: newPosition,
      backgroundColor: backgroundHover,
    });
    event.stopPropagation();
  };
  /* Update the position of the Controls Panel on move event */
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
  /* Reset the background color of the Controls Panel and dragging flag. */
  onMouseUp = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.currentTarget.style.cursor = 'auto';
    this.setState({ dragging: false, backgroundColor: defaultBackground });
    event.stopPropagation();
  };
  /* Cancel the movement when the mouse icon exits the panel. */
  onMouseLeave = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.currentTarget.style.cursor = 'auto';
    this.setState({ dragging: false, backgroundColor: defaultBackground });
    event.stopPropagation();
  };

  /*  Update the the background and enable dragging*/
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

  /* Update the position object based on orientation and reset the background color and dragging flag */
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
  /* Update the postiion of the Controls Panel */
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
    // Verify that the panel is in the viewport
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
  // Hide the Controls Panel
  toggleControls = (
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.TouchEvent<HTMLButtonElement>,
  ) => {
    this.setState({ showControls: !this.state.showControls });
    event.currentTarget.blur();
    event.stopPropagation();
    event.preventDefault();
  };
  // Toggle the Axis on the model
  toggleAxes = (
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.TouchEvent<HTMLButtonElement>,
  ) => {
    event.currentTarget.blur();
    this.props.displayAxis(!this.state.showAxes);
    this.setState({ showAxes: !this.state.showAxes });
    event.stopPropagation();
  };
  // Toggle the Labels on the model
  toggleLabels = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.currentTarget.blur();
    const label = !this.state.showLabels;
    this.setState({ showLabels: label });
    this.props.displayLabel(label);
    event.stopPropagation();
  };
  // Run the callback to start the animation via ThreeContainer
  startAnimation = (robotValues: RobotValue[]) => {
    this.props.startAnimation(robotValues);
    this.setState({ animation: true });
  };
  // Run the callback to stop the animation via ThreeContainer
  stopAnimation = () => {
    this.setState({ animation: false });
    this.props.stopAnimation();
  };
  /* Show the controls panel. Called on by a click on the "show-controls" div*/
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
  /* Written to stop propagation on either mouse or touch events. This needs to 
  be added to any clickable/pressable object, otherwise the event will propagate
  up to the draggable control panel.                                            */
  stopPropagation = (
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.TouchEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
  };
  /* Updates the background on the "show-controls" div when pressing down*/
  pressShowControls = (event: React.TouchEvent<HTMLDivElement>) => {
    console.log('button event start');
    this.setState({ backgroundColor: backgroundHover });
    event.stopPropagation();
  };
  /* Update state to store slider values, as well as use parent callback to update
  the threejs model of the owi arm                                                */
  updateArmConfig = (index: number, value: number): void => {
    const config = this.state.robotValues.slice();
    config[index] = value;
    this.setState({ robotValues: config });
    this.props.updateConfig(index, value);
  };
  /* Show slider components */
  renderSlider = (config: SliderConfig, index: number) => (
    <ValueSlider
      disabled={this.state.animation}
      value={this.state.robotValues[index]}
      key={index}
      {...config}
      updateValue={this.updateArmConfig}
      index={index}
      endEffectorYcor={this.props.getEndEffectorYcor}
      effectorIntersect={this.props.effectorIntersect}
    />
  );
  /* Reset the sliders to 0, and use callback to reset the position of the owi arm*/
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
              disabled={this.state.animation}
              variant="primary"
              aria-label="First group"
              onClick={this.toggleControls}
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
              disabled={this.state.animation}
              aria-label="Second group"
              onClick={this.toggleAxes}
              onMouseDown={this.stopPropagation}
              onTouchStart={this.stopPropagation}
              onMouseUp={this.stopPropagation}
              onTouchEnd={this.stopPropagation}
            >
              {this.state.showAxes ? 'Hide Axes' : 'Show Axes'}
            </Button>

            <Button
              size="lg"
              disabled={this.state.animation}
              variant="primary"
              aria-label="Third group"
              onClick={this.toggleLabels}
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
            startAnimation={this.startAnimation}
            stopAnimation={this.stopAnimation}
            animate={this.state.animation}
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
