import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
  initiateGetAccntDetails,
  initiateAddAccntDetails,
  initiateUpdateAccntDetails
} from '../actions/account';
import {
  initiateWithdrawAmount,
  initiateDepositAmount
} from '../actions/transactions';
import { resetErrors } from '../actions/errors';
import { validateFields } from '../utils/common';
import { maskNumber } from '../utils/mask';
import AddAccountForm from './AddAccountForm';

class AccountForm extends React.Component {
  state = {
    amount: '',
    account: this.props.account,
    editAccount: false,
    ifsc: '',
    errorMsg: ''
  };

  componentDidMount() {
    const { email } = this.props;
    if (email) {
      this.props.dispatch(initiateGetAccntDetails());
    }
  }

  componentWillUnmount() {
    this.props.dispatch(resetErrors());
  }

  componentDidUpdate(prevProps) {
    if (!_.isEqual(prevProps.account, this.props.account)) {
      this.setState({ account: this.props.account });
    }
    if (!_.isEqual(prevProps.errors, this.props.errors)) {
      this.setState({ errorMsg: this.props.errors });
    }
  }

  handleUpdateAccount = (ifsc) => {
    const fieldsToValidate = [{ ifsc }];

    const allFieldsEntered = validateFields(fieldsToValidate);
    if (!allFieldsEntered) {
      this.setState({
        errorMsg: {
          update_error: 'Пожалуйста введите ПИН-код.'
        }
      });
    } else {
      this.setState({
        errorMsg: ''
      });
      this.props.dispatch(initiateUpdateAccntDetails(ifsc));
    }
  };

  handleAmountChange = (event) => {
    this.setState({ amount: event.target.value });
  };

  handleEditAccount = (event) => {
    event.preventDefault();
    this.setState((prevState) => ({ editAccount: !prevState.editAccount }));
  };

  handleInputChange = (event) => {
    this.setState({
      ifsc: event.target.value
    });
  };

  handleOnSubmit = (event) => {
    event.preventDefault();
    let { amount, account } = this.state;

    const { selectedType } = this.props;
    const fieldsToValidate = [{ amount }];

    const allFieldsEntered = validateFields(fieldsToValidate);
    if (!allFieldsEntered) {
      this.setState({
        errorMsg: {
          [selectedType === 'снять'
            ? 'withdraw_error'
            : 'add_error']: 'Пожалуйста введите сумму.'
        }
      });
    } else {
      let { total_balance } = account;
      amount = +amount;
      total_balance = +total_balance;
      if (selectedType === 'withdraw' && amount <= total_balance) {
        this.props.dispatch(initiateWithdrawAmount(account.account_id, amount));
        this.setState({
          errorMsg: ''
        });
      } else if (selectedType === 'deposit') {
        this.props.dispatch(initiateDepositAmount(account.account_id, amount));
        this.setState({
          errorMsg: ''
        });
      } else {
        this.setState({
          errorMsg: {
            [selectedType === 'withdraw'
              ? 'withdraw_error'
              : 'add_error']: "Недостаточно средств на счету"
          }
        });
      }
    }
  };

  handleAddAccount = (account) => {
    const { account_no, bank_name, ifsc } = account;
    this.props
      .dispatch(initiateAddAccntDetails(account_no, bank_name, ifsc))
      .then(() => this.props.dispatch(initiateGetAccntDetails()));
  };

  render() {
    const { selectedType } = this.props;
    const { editAccount, ifsc, errorMsg, account } = this.state;
    const account_no = account.account_no ? maskNumber(account.account_no) : '';
    const type = selectedType.charAt(0).toUpperCase() + selectedType.slice(1);
    return account_no ? (
      editAccount ? (
        <div className="edit-account-form  col-md-6 offset-md-3">
          <h3>
            Данные учетной записи
            <a
              href="/#"
              className="edit-account"
              onClick={this.handleEditAccount}
            >
              Назад
            </a>
          </h3>
          <hr />
          <Form>
            {errorMsg && errorMsg.update_error && (
              <p className="errorMsg">{errorMsg.update_error}</p>
            )}
            <Form.Group controlId="acc_no">
              <Form.Label>Номер счета:</Form.Label>
              <span className="label-value">{account && account_no}</span>
            </Form.Group>
            <Form.Group controlId="bank_name">
              <Form.Label>Банк:</Form.Label>
              <span className="label-value">
                {account && account.bank_name}
              </span>
            </Form.Group>
            <Form.Group controlId="ifsc">
              <Form.Label>ПИН-код:</Form.Label>
              <span className="label-value">{account && account.ifsc}</span>
              <Form.Control
                type="text"
                placeholder="Введите новый ПИН-код"
                value={ifsc}
                onChange={this.handleInputChange}
              />
            </Form.Group>
            <Button
              variant="primary"
              onClick={() => this.handleUpdateAccount(ifsc)}
            >
              Обновить данные
            </Button>
          </Form>
        </div>
      ) : (
        <div className="account-form col-md-6 offset-md-3">
          {errorMsg && errorMsg.withdraw_error && (
            <p className="errorMsg">{errorMsg.withdraw_error}</p>
          )}
          {errorMsg && errorMsg.add_error && (
            <p className="errorMsg">{errorMsg.add_error}</p>
          )}
          <Form onSubmit={this.handleOnSubmit} className="account-form">
            <Form.Group controlId="type">
              <Form.Label>{type}</Form.Label>
              <a
                href="/#"
                className="edit-account"
                onClick={this.handleEditAccount}
              >
                Изменить данные
              </a>
            </Form.Group>
            <hr />
            <Form.Group controlId="accnt_no">
              <Form.Label>Номер счета: </Form.Label>
              <span className="label-value">{account && account_no}</span>
            </Form.Group>
            <Form.Group controlId="accnt_no">
              <Form.Label>Ваш баланс: </Form.Label>
              <span className="label-value">
                {account && account.total_balance}
              </span>
            </Form.Group>
            <Form.Group controlId="amount">
              <Form.Label>Сумма:</Form.Label>
              <Form.Control
                type="number"
                placeholder={`Введите сумму для ${selectedType}`}
                value={this.state.amount}
                onChange={this.handleAmountChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Отправить
            </Button>
          </Form>
        </div>
      )
    ) : (
      <AddAccountForm handleAddAccount={this.handleAddAccount} />
    );
  }
}

const mapStateToProps = (state) => ({
  email: state.auth && state.auth.email,
  account: state.account,
  errors: state.errors
});

export default connect(mapStateToProps)(AccountForm);