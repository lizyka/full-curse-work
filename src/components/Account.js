import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import AccountForm from './AccountForm';
import Summary from './Summary';

class Account extends React.Component {
  state = {
    selectedType: 'withdraw'
  };

  setSelectedType = (selectedType) => {
    this.setState({ selectedType });
  };

  render() {
    const { selectedType } = this.state;

    return (
      <div>
        <div className="account">
          <Button
            variant="primary"
            className={`${
              selectedType === 'withdraw' ? 'active account-btn' : 'account-btn'
            }`}
            onClick={() => this.setSelectedType('withdraw')}
          >
            Снять
          </Button>
          <Button
            variant="secondary"
            className={`${
              selectedType === 'deposit' ? 'active account-btn' : 'account-btn'
            }`}
            onClick={() => this.setSelectedType('deposit')}
          >
            Внести
          </Button>

        </div>
        <div>
          {selectedType === 'withdraw' || selectedType === 'deposit' ? (
            <AccountForm selectedType={selectedType} />
          ) : (
            <Summary />
          )}
        </div>
      </div>
    );
  }
}
export default connect()(Account);