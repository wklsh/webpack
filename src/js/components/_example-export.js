/*--------------------------------------------------------------------------------------
 This is an Example file, it should contain a specific function / interaction of the project
 --------------------------------------------------------------------------------------*/
 function testFunc1() {
	console.log('Calling from [_example-export.js]');
 }

  function testFunc2() {
	console.log('Second call from [_example-export.js]');
 }





/*--------------------------------------------------------------------------------------
 Exports
 --------------------------------------------------------------------------------------*/
// Exposes the function to a require in another file
module.exports = { 
	testFunc1,
	testFunc2
	// add more functions...
}
