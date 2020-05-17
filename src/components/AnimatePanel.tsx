import React from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import '../App.scss';
class AnimatePanel extends React.PureComponent {
  render() {
    return (
      <div>
        <div className="positions-container">
          <h4>Set Arm Movement</h4>
          <p>
            Use the controls below to set a sequence of angle positions. Use the
            animate button to show the robot arm motion.
          </p>
          <div className="position-button-container">
            <Button size="lg" aria-label="positions-button" variant="secondary">
              Load Current Position
            </Button>
          </div>
        </div>

        <div className="button-container">
          <ButtonToolbar aria-label="Toolbar with button groups">
            <ButtonGroup className="mr-2">
              <Button size="lg" variant="primary" aria-label="First group">
                Reset Arm
              </Button>
            </ButtonGroup>
            <ButtonGroup className="mr-2">
              <Button size="lg" variant="primary" aria-label="Second group">
                Animate
              </Button>
            </ButtonGroup>
            <ButtonGroup>
              <Button size="lg" variant="primary" aria-label="Third group">
                Stop
              </Button>
            </ButtonGroup>
          </ButtonToolbar>
        </div>
      </div>
    );
  }
}

export default AnimatePanel;
