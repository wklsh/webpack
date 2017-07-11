/*--------------------------------------------------------------------------------------
 Dev / Prod enviroment exposed by webpack, we can control inputs during compile time.
 --------------------------------------------------------------------------------------*/
	if (PRODUCTION) {
		//... script imports in here
	} else if (DEVELOPMENT) {
		console.log('%c RUNNING IN DEV MODE ', 'background: #ff0000; color: #fff; font-size: 15px; padding: 2px 15px;');
		//... script imports in here
	}


/*--------------------------------------------------------------------------------------
 Imports
 --------------------------------------------------------------------------------------*/
	//- CSS
		require('../scss/bundle-scss.scss');
	// JS
		require('_components/example-import');
