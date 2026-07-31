jest.mock('../config/db', () => ({
  getConnection: jest.fn(),
}));

const pool = require('../config/db');
const Movimiento = require('../models/Movimiento');

describe('Movimiento.registrar - lógica de stock', () => {
  let mockConn;

  beforeEach(() => {
    mockConn = {
      beginTransaction: jest.fn(),
      query: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn(),
    };
    pool.getConnection.mockResolvedValue(mockConn);
  });

  test('una entrada suma correctamente al stock actual', async () => {
    mockConn.query
      .mockResolvedValueOnce([[{ stock_actual: 50 }]])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{ insertId: 1 }]);

    const resultado = await Movimiento.registrar({
      producto_id: 1, usuario_id: 1, tipo: 'entrada', cantidad: 20, motivo: 'Test'
    });

    expect(resultado.stock_anterior).toBe(50);
    expect(resultado.stock_nuevo).toBe(70);
    expect(mockConn.commit).toHaveBeenCalled();
  });

  test('una salida resta correctamente del stock actual', async () => {
    mockConn.query
      .mockResolvedValueOnce([[{ stock_actual: 50 }]])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{ insertId: 2 }]);

    const resultado = await Movimiento.registrar({
      producto_id: 1, usuario_id: 1, tipo: 'salida', cantidad: 15, motivo: 'Test'
    });

    expect(resultado.stock_anterior).toBe(50);
    expect(resultado.stock_nuevo).toBe(35);
  });

  test('rechaza una salida mayor al stock disponible', async () => {
    mockConn.query.mockResolvedValueOnce([[{ stock_actual: 10 }]]);

    await expect(Movimiento.registrar({
      producto_id: 1, usuario_id: 1, tipo: 'salida', cantidad: 999, motivo: 'Test'
    })).rejects.toThrow('Stock insuficiente');

    expect(mockConn.rollback).toHaveBeenCalled();
  });

  test('rechaza un tipo de movimiento inválido', async () => {
    mockConn.query.mockResolvedValueOnce([[{ stock_actual: 10 }]]);

    await expect(Movimiento.registrar({
      producto_id: 1, usuario_id: 1, tipo: 'otro', cantidad: 5, motivo: 'Test'
    })).rejects.toThrow('Tipo de movimiento inválido');
  });

  test('convierte cantidad de string a número correctamente', async () => {
    mockConn.query
      .mockResolvedValueOnce([[{ stock_actual: 15 }]])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{ insertId: 3 }]);

    const resultado = await Movimiento.registrar({
      producto_id: 1, usuario_id: 1, tipo: 'entrada', cantidad: '10', motivo: 'Test'
    });

    expect(resultado.stock_nuevo).toBe(25);
  });
});