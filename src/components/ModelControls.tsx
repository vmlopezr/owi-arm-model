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
  portraitPos: Position;
  landscapePos: Position;
  dragging: boolean;
  rel: Position;
  backgroundColor: string;
  width: string | number;
  height: string | number;
  overflow: string;
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
const backgroundLargeScreen = '#222831e0';
const backgroundHover = '#222831c0';

class ModelControls extends React.PureComponent<Props, State> {
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
      landscapePos: { x: innerHeight * 0.5, y: 0 },
      rel: { x: 0, y: 0 },
      backgroundColor: backgroundLargeScreen,
      width: '35%',
      height: '100%',
      overflow: 'auto',
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
        backgroundColor: backgroundLargeScreen,
        width: isPortrait ? '100%' : '50%',
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
          backgroundColor: backgroundLargeScreen,
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
    console.log('mouse up');
    event.currentTarget.style.cursor = 'auto';
    this.setState({ dragging: false, backgroundColor: backgroundLargeScreen });
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
    this.setState({ dragging: false, backgroundColor: backgroundLargeScreen });
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
        backgroundColor: backgroundLargeScreen,
        portraitPos: this.state.pos,
        overflow: 'auto',
      });
    } else {
      this.setState({
        dragging: false,
        backgroundColor: backgroundLargeScreen,
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
  render() {
    return (
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
          minWidth: this.onMobile ? undefined : 300,
          overflow: this.state.overflow,
        }}
      >
        <h1>OWI Robot Arm: Controls</h1>
        <p id="text">
          Use the sliders move the associated robot arm joints. Click, touch,
          drag or scroll on the model screen to transform the display. Press and
          hold to drag the panel.
        </p>
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
