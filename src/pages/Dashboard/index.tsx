import React, { useState, useEffect, useContext, useCallback } from 'react';
import { ThemeContext } from 'styled-components';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';
import TransitionsModal from '../../components/Modal';
import { useModal } from '../../hooks/modal';

import formatValue from '../../utils/formatValue';

import {
  Container,
  CardContainer,
  Card,
  TableContainer,
  Button,
} from './styles';

interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  category: { title: string };
  created_at: Date;
}

interface Balance {
  income: string;
  outcome: string;
  total: string;
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance>({} as Balance);
  const { open, handleOpen } = useModal();

  const { colors } = useContext(ThemeContext);

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      const response = await api.get('/transactions');
      const transactionsData = response.data.transactions;
      const balanceData = response.data.balance;

      const formattedTransaction = transactionsData.map(
        (transaction: Transaction) => ({
          ...transaction,
          formattedValue: formatValue(transaction.value),
          formattedDate: new Date(transaction.created_at).toLocaleDateString(
            'pt-br',
          ),
        }),
      );

      setTransactions(formattedTransaction);

      const formattedBalance = {
        income: formatValue(balanceData.income),
        outcome: formatValue(balanceData.outcome),
        total: formatValue(balanceData.total),
      };
      setBalance(formattedBalance);
    }

    loadTransactions();
  }, [open, transactions]);

  const handleRemoveTransaction = useCallback(
    async (id: string): Promise<void> => {
      await api.delete(`/transactions/${id}`);

      const filteredTransaction = transactions.filter(
        transaction => transaction.id !== id,
      );
      setTransactions(filteredTransaction);
    },
    [transactions],
  );

  return (
    <>
      <Header />
      <Container>
        {open && <TransitionsModal />}

        {balance && (
          <CardContainer>
            <Card
              background={`${colors.backgroundCard}`}
              text={`${colors.cardText}`}
            >
              <header>
                <p>Entradas</p>
                <img src={income} alt="Income" />
              </header>
              <h1 data-testid="balance-income">{balance.income}</h1>
            </Card>
            <Card
              background={`${colors.backgroundCard}`}
              text={`${colors.cardText}`}
            >
              <header>
                <p>Saídas</p>
                <img src={outcome} alt="Outcome" />
              </header>
              <h1 data-testid="balance-outcome">{balance.outcome}</h1>
            </Card>
            <Card
              total
              background={`${colors.backgroundCardTotal}`}
              text="#fff"
            >
              <header>
                <p>Total</p>
                <img src={total} alt="Total" />
              </header>
              <h1 data-testid="balance-total">{balance.total}</h1>
            </Card>
          </CardContainer>
        )}

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Data</th>
                <th>
                  <Button onClick={handleOpen}>
                    <FiPlus color="blue" />
                  </Button>
                </th>
              </tr>
            </thead>

            <tbody>
              {transactions.map(transaction => (
                <tr className="animation" key={transaction.id}>
                  <td className="title">{transaction.title}</td>
                  <td className={transaction.type}>
                    {transaction.type === 'outcome' && '- '}
                    {transaction.formattedValue}
                  </td>
                  <td>{transaction.category.title}</td>
                  <td>{transaction.formattedDate}</td>
                  <td>
                    <Button
                      onClick={() => handleRemoveTransaction(transaction.id)}
                    >
                      <FiTrash2 color="red" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;
