'use strict';

import MyFtClient from './src/myft-client.js';

export default new MyFtClient({
	apiReadRoot: 'https://myft-api.ft.com/v1/',
	apiWriteRoot: 'https://ft-next-myft-api.herokuapp.com/v1/'
});
