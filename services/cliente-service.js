const oracledb = require('oracledb');

oracledb.outFormat = oracledb.OBJECT;
oracledb.fetchAsString = [oracledb.CLOB];
oracledb.autoCommit = true;

const CLIENTES_COLLECTION = 'clientes';

module.exports = class ClienteService {
    constructor() { }

    static async init() {
        console.log(`process.env.DB_USER: ${process.env.DB_USER}`);
        console.log(`process.env.DB_PASSWORD: ${process.env.DB_PASSWORD}`);
        console.log(`process.env.CONNECT_STRING: ${process.env.CONNECT_STRING}`);

        console.log('Criando pool de conexões...')
        await oracledb.createPool({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.CONNECT_STRING,
        });
        console.log('Pool de conexões criado.')
        return new ClienteService();
    }

    async getAll() {
        let connection;
        const result = [];

        try {
            // cria conexao com o db
            connection = await oracledb.getConnection();

            // seta a conexao para o tipo JSON
            // Simple Oracle Document Access
            const soda = connection.getSodaDatabase();

            // cria coleção de dados de clientes, caso exista, retorna a existente
            const clienteCollection = await soda.createCollection(CLIENTES_COLLECTION);

            // recebe os registros dos clientes
            let clientes = await clienteCollection.find().getDocuments();

            console.log("clientes:", clientes)

            // faz forEach no array de registros de clientes
            clientes.forEach((element) => {
                result.push({
                    id: element.key,
                    createdOn: element.createdOn,
                    lastModified: element.lastModified,
                    ...element.getContent(),
                });
            });

        } catch (err) {
            console.error(err);
        } finally {
            // fecha a conexão
            if (connection) {
                try {
                    await connection.close();
                }
                catch (err) {
                    console.error(err);
                }
            }
        }
        return result;
    }


    async getById(clienteId) {
        let connection, cliente, result;

        try {
            connection = await oracledb.getConnection();

            const soda = connection.getSodaDatabase();
            const clientesCollection = await soda.createCollection(CLIENTES_COLLECTION);

            //find by key: procura pelo id
            cliente = await clientesCollection.find().key(clienteId).getOne();
            result = {
                id: cliente.key,
                createdOn: cliente.createdOn,
                lastModified: cliente.lastModified,
                ...cliente.getContent(),
            };

        } catch (err) {
            console.error(err);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                }
                catch (err) {
                    console.error(err);
                }
            }
        }

        return result;
    }

    async save(cliente) {
        let connection, novoCliente, result;

        try {
            connection = await oracledb.getConnection();
            const soda = connection.getSodaDatabase();
            const clientesCollection = await soda.createCollection(CLIENTES_COLLECTION);
            /*
                insertOneAndGet() does not return the doc
                for performance reasons
                see: http://oracle.github.io/node-oracledb/doc/api.html#sodacollinsertoneandget
            */
           
            // add e retona o cliente
            novoCliente = await clientesCollection.insertOneAndGet(cliente);

            // cria objeto com os dados do novo cliente
            result = {
                id: novoCliente.key,
                createdOn: novoCliente.createdOn,
                lastModified: novoCliente.lastModified,
            };
        } catch (err) {
            console.error(err);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                }
                catch (err) {
                    console.error(err);
                }
            }
        }

        return result;
    }

    async update(id, cliente) {
        let connection, result;

        try {
            connection = await oracledb.getConnection();
            const soda = connection.getSodaDatabase();
            const clienteCollection = await soda.createCollection(CLIENTES_COLLECTION);

            // faz update/replace e retorna o cliente
            cliente = await clienteCollection.find().key(id).replaceOneAndGet(cliente);
            result = {
                id: cliente.key,
                createdOn: cliente.createdOn,
                lastModified: cliente.lastModified,
            };
        } catch (err) {
            console.error(err);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                }
                catch (err) {
                    console.error(err);
                }
            }
        }

        return result;
    }

    async deleteById(clienteId) {
        let connection;
        let removed = false;

        try {
            connection = await oracledb.getConnection();

            const soda = connection.getSodaDatabase();
            const clienteCollection = await soda.createCollection(CLIENTES_COLLECTION);

            // remove/delete by id
            removed = await clienteCollection.find().key(clienteId).remove();

        } catch (err) {
            console.error(err);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                }
                catch (err) {
                    console.error(err);
                }
            }
        }

        return removed;
    }

    async closePool() {
        console.log('Closing connection pool...');
        try {
            await oracledb.getPool().close(10);
            console.log('Pool closed');
        } catch (err) {
            console.error(err);
        }
    }
}
