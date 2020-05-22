import React from 'react';
import Button from 'react-bootstrap/Button';
import { AngleAccordion } from './AngleAccordion';
import './styles/AnimatePanel.scss';
import { TextInput } from './TextInput';

export interface RobotValue {
  values: number[];
}
interface Props {
  resetPosition(): void;
  receiveRobotValues(): number[];
  startAnimation(robotValues: RobotValue[]): void;
  stopAnimation(): void;
  animate: boolean;
}
interface State {
  RobotValues: RobotValue[];
  selectedPositions: number[];
  select: boolean;
}
export type RobotValueKey =
  | 'joint1'
  | 'joint2'
  | 'joint3'
  | 'joint4'
  | 'gripper';
class AnimatePanel extends React.PureComponent<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      select: false,
      selectedPositions: [],
      RobotValues: [{ values: [0, 0, 0, 0, 0] }],
    };
  }
  resetPosition = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.currentTarget.blur();
    this.props.resetPosition();
    event.stopPropagation();
  };
  stopPropagation = (
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.TouchEvent<HTMLButtonElement>
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.TouchEvent<HTMLDivElement>,
  ) => {
    event.stopPropagation();
  };
  onAddItem = (
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.TouchEvent<HTMLButtonElement>,
  ) => {
    event.currentTarget.blur();
    this.setState({
      RobotValues: [...this.state.RobotValues, { values: [0, 0, 0, 0, 0] }],
    });
    event.stopPropagation();
  };
  selectItem = (index: number) => {
    const list = this.state.selectedPositions;
    list.push(index);
    this.setState({ selectedPositions: list });
  };
  deSelectItem = (index: number) => {
    const list = this.state.selectedPositions;
    list.splice(index, 1);
    this.setState({ selectedPositions: list });
  };
  setSelectState = (
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.TouchEvent<HTMLButtonElement>,
  ) => {
    event.currentTarget.blur();
    this.setState({ select: true });
    event.stopPropagation();
  };
  cancelSelect = (
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.TouchEvent<HTMLButtonElement>,
  ) => {
    event.currentTarget.blur();
    this.setState({ select: false });
    event.stopPropagation();
  };
  onDeleteItems = (
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.TouchEvent<HTMLButtonElement>,
  ) => {
    event.currentTarget.blur();

    const robotValuesCopy = [...this.state.RobotValues];
    const selectedPositions = [...this.state.selectedPositions];
    selectedPositions.sort((a, b) => b - a);
    selectedPositions.forEach((index) => {
      robotValuesCopy.splice(index, 1);
    });

    this.setState({
      RobotValues: robotValuesCopy,
      select: false,
      selectedPositions: [],
    });
    event.stopPropagation();
  };
  loadCurrentPosition = (
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.TouchEvent<HTMLButtonElement>,
  ) => {
    event.currentTarget.blur();
    event.stopPropagation();
    const { length } = this.state.RobotValues;
    if (length === 0) return;
    const position = this.props.receiveRobotValues();
    const index = this.state.RobotValues.length - 1;
    const robotValueCopy = [...this.state.RobotValues];
    robotValueCopy[index] = {
      values: position,
    };
    this.setState({ RobotValues: robotValueCopy });
  };
  startAnimation = (
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.TouchEvent<HTMLButtonElement>,
  ) => {
    this.props.startAnimation(this.state.RobotValues);
    event.currentTarget.blur();
    event.stopPropagation();
  };
  stopAnimation = (
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.TouchEvent<HTMLButtonElement>,
  ) => {
    this.props.stopAnimation();
    event.currentTarget.blur();
    event.stopPropagation();
  };
  updateRobotValue = (index: number, valueIndex: number, value: number) => {
    const robotValuesCopy = [...this.state.RobotValues];
    robotValuesCopy[index].values[valueIndex] = value;
    this.setState({ RobotValues: robotValuesCopy });
  };
  renderAccordion = () => {
    return (
      <div
        style={{ padding: 10 }}
        onMouseUp={this.stopPropagation}
        onTouchEnd={this.stopPropagation}
        onMouseDown={this.stopPropagation}
        onTouchStart={this.stopPropagation}
      >
        {this.state.RobotValues.map((item, index) => {
          return (
            <AngleAccordion
              key={index + 'g'}
              index={index}
              selectItem={this.selectItem}
              deSelectItem={this.deSelectItem}
              onSelect={this.state.select}
            >
              {{
                header: <div>{`Position ${index + 1}`}</div>,
                body: (
                  <div>
                    <TextInput
                      value={item.values[0].toString()}
                      label={'Joint 1'}
                      index={index}
                      valueIndex={0}
                      updateRobotValue={this.updateRobotValue}
                      min={-135}
                      max={135}
                    />
                    <TextInput
                      value={item.values[1].toString()}
                      label={'Joint 2'}
                      index={index}
                      valueIndex={1}
                      updateRobotValue={this.updateRobotValue}
                      min={-85}
                      max={85}
                    />
                    <TextInput
                      value={item.values[2].toString()}
                      label={'Joint 3'}
                      index={index}
                      valueIndex={2}
                      updateRobotValue={this.updateRobotValue}
                      min={-135}
                      max={135}
                    />
                    <TextInput
                      value={item.values[3].toString()}
                      label={'Joint 4'}
                      index={index}
                      valueIndex={3}
                      updateRobotValue={this.updateRobotValue}
                      min={-60}
                      max={60}
                    />
                    <TextInput
                      value={item.values[4].toString()}
                      label={'Gripper'}
                      index={index}
                      valueIndex={4}
                      updateRobotValue={this.updateRobotValue}
                      min={0}
                      max={100}
                    />
                  </div>
                ),
              }}
            </AngleAccordion>
          );
        })}
      </div>
    );
  };
  render() {
    const { select } = this.state;
    const { animate } = this.props;
    return (
      <div>
        <div className="positions-container">
          <h4>Set Arm Movement</h4>
          <p>
            Use the controls below to set a sequence of angle positions. Use the
            animate button to show the robot arm motion.
          </p>
          <div className="button-container">
            <Button
              size="lg"
              aria-label="positions-button"
              variant="primary"
              disabled={animate}
              onClick={select ? this.cancelSelect : this.setSelectState}
              onMouseUp={this.stopPropagation}
              onTouchEnd={this.stopPropagation}
              onMouseDown={this.stopPropagation}
              onTouchStart={this.stopPropagation}
            >
              {this.state.select ? 'Cancel' : 'Select'}
            </Button>
            <Button
              size="lg"
              disabled={animate}
              aria-label="positions-button"
              variant="primary"
              onClick={select ? this.onDeleteItems : this.onAddItem}
              onMouseUp={this.stopPropagation}
              onTouchEnd={this.stopPropagation}
              onMouseDown={this.stopPropagation}
              onTouchStart={this.stopPropagation}
            >
              {select ? 'Delete' : 'Add'}
            </Button>
            <Button
              size="lg"
              disabled={select || animate}
              aria-label="positions-button"
              variant="primary"
              onClick={this.loadCurrentPosition}
              onMouseUp={this.stopPropagation}
              onTouchEnd={this.stopPropagation}
              onMouseDown={this.stopPropagation}
              onTouchStart={this.stopPropagation}
            >
              Current Position
            </Button>
          </div>
          {this.renderAccordion()}
        </div>

        <div className="button-container">
          <Button
            size="lg"
            disabled={select || animate}
            variant="primary"
            aria-label="First group"
            onClick={this.resetPosition}
            onMouseUp={this.stopPropagation}
            onTouchEnd={this.stopPropagation}
            onMouseDown={this.stopPropagation}
            onTouchStart={this.stopPropagation}
          >
            Reset Arm
          </Button>
          <Button
            size="lg"
            disabled={select || animate}
            variant="primary"
            aria-label="Second group"
            onClick={this.startAnimation}
            onMouseUp={this.stopPropagation}
            onTouchEnd={this.stopPropagation}
            onMouseDown={this.stopPropagation}
            onTouchStart={this.stopPropagation}
          >
            Animate
          </Button>
          <Button
            size="lg"
            disabled={select || !animate}
            variant="primary"
            aria-label="Third group"
            onClick={this.stopAnimation}
            onMouseUp={this.stopPropagation}
            onTouchEnd={this.stopPropagation}
            onMouseDown={this.stopPropagation}
            onTouchStart={this.stopPropagation}
          >
            Stop
          </Button>
        </div>
      </div>
    );
  }
}

export default AnimatePanel;
