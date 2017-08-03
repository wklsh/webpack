const path = require('path');
const webpack = require('webpack');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const ResourceHintWebpackPlugin = require('resource-hints-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CopyWebpackPlugin = require('copy-webpack-plugin');
/*-----------------------------------------------------------------------------*/ 
// Webpack Bundle Analyzer *** UNCOMMENT THIS SECTION
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
/*------------------------------------------------------------------------------*/ 

console.log("============================================================================");
console.log("process.env.NODE_ENV: " + process.env.NODE_ENV.toUpperCase());
console.log("============================================================================");




/*------------------------------------------------------------------------------------------- 
 * PLUGIN
 *-----------------------------------------------------------------------------------------*/
	const pluginsArray = [
		//- Expose Dev/Prod Enviroment to JS
		//-----------------------------------------------------------------------
			new webpack.DefinePlugin({
			    DEVELOPMENT: JSON.stringify(process.env.NODE_ENV === "development"),
			    PRODUCTION: JSON.stringify(process.env.NODE_ENV === "production"),
			}),

		//- Split common chunks into a seperate JS vendor file
		//-----------------------------------------------------------------------
			// new webpack.optimize.CommonsChunkPlugin({
			//   name: "vendor",
			//   // filename: "js/bundle-vendor.[hash].js",
			//   filename: "js/bundle-vendor.js",
			//   minChunks: 5,
			// }),

		//- Extract out CSS into a seperate file
		//-----------------------------------------------------------------------
			new ExtractTextPlugin({
				// filename: 'main.[hash].css',
				filename: 'bundle-scss.css',
				allChunks: true,
			}),

		//- Include JQuery
		//-----------------------------------------------------------------------
			new webpack.ProvidePlugin({
				$: 'jquery',
				jQuery: 'jQuery',
				'window.jQuery': 'jquery',
		        'window.$': 'jquery',
			}),

		//- Prefetch JS files
		//-----------------------------------------------------------------------
			new HtmlWebpackPlugin({
				prefetch: ['*.js', 'data.json'],
				preload: '*.*'
			}),

		//- HTML Webpack individual files
		//-----------------------------------------------------------------------
			// HTML Files - Index
				new HtmlWebpackPlugin({
					chunks: ['index'],
					preload: false,
					filename: 'index.html',
					template: 'src/index.html'
				}),

		//- Favicon generation
		//-----------------------------------------------------------------------
			// new FaviconsWebpackPlugin({
			// 	logo: './src/favicon.png',
			//     prefix: 'favico/',
			// }),

		//- Copies individual files or entire directories to DIST without bundling
		//-----------------------------------------------------------------------
			new CopyWebpackPlugin([
				{ from: 'src/externals/js/*', to: 'externals/js/[name].[ext]' },
				{ from: 'src/externals/video/*', to: 'externals/video/[name].[ext]' }
			]),

		/*---------------------------------------------------------------------*/ 
		// Webpack Bundle Analyzer *** UNCOMMENT THIS SECTION
			// new BundleAnalyzerPlugin(),
		/*---------------------------------------------------------------------*/ 

		//- Image Optimisation- to be the last plugin to init 
		//-----------------------------------------------------------------------
			new ImageminPlugin({
				disable: process.env.NODE_ENV == 'development',
				test: 'img/***',
					mozjpeg: {
						progressive: true,
					},
					gifsicle: {
						interlaced: false,
					},
					optipng: {
						optimizationLevel: 4,
					},
					pngquant: {
						quality: '75-90',
						speed: 3,
					},
					svgo: {
						removeViewBox: false,
						removeEmptyAttrs: false,
					},
			}),

		//- Init Prefetch JS
		//-----------------------------------------------------------------------
			new ResourceHintWebpackPlugin(),
	]

	//- RUNS ONLY IN PRODUCTION MODE
	if (process.env.NODE_ENV === "production") {
	    pluginsArray.push(
	    	//- Remove Dist folder before compiling
			//-------------------------------------------------------------------
				new CleanWebpackPlugin(['dist']),

			//- UglifyJS
			//-----------------------------------------------------------------------
				new webpack.optimize.UglifyJsPlugin({ compress:{ warnings: false } }),

			//- AggressiveMerging
			//-----------------------------------------------------------------------
				new webpack.optimize.AggressiveMergingPlugin()
	    );
	}






/*------------------------------------------------------------------------------------------- 
 * CONFIG
 *-----------------------------------------------------------------------------------------*/
	const config = {
		entry: {
			index: './src/js/bundle-index.js',
		},

		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: 'js/bundle-[name].js',
		},

		devServer: {
			contentBase: '.',
			host: '0.0.0.0',
			port: 3000,
			disableHostCheck: true,
		},

		devtool: "#inline-source-map", // Default development sourcemap

		module: {
			rules: [
				{
	                test: /\.scss$/,
					use: ExtractTextPlugin.extract({
						use: [
							{
								loader: 'css-loader',
								options: {
									modules: true,
									importLoaders: 2,
									localIdentName: '[local]',
									sourceMap: true,
									minimize: true,
								}
							},
				            { loader: 'postcss-loader', options: { sourceMap: true, }},
				            { loader: 'sass-loader', options: { sourceMap: true,}},
						]
					})
				},
				{
					test: /\.html$/,
					use: [
						{
							loader: 'html-loader',
							options: {
								minimize: true,
								collapseWhitespace: false,
								removeComments: false,
								interpolate: true,
							}
						},
					],
				},
				{
					test: /\.js$/,
					exclude: /node_module/,
					use: [{
						loader: 'babel-loader',
						options: { presets: ['es2015'] },
					}],
				},
				{
					test: /\.(gif|png|jpe?g|svg)$/i,
					use: [
						{
							loader: 'file-loader',
							options: {
								// name: '[name].[hash].[ext]',
								name: '[name].[ext]',
								outputPath: 'img/'
							}
						},
					]
				},
				{
					test: /\.(eot|ttf|woff|woff2)$/i,
	                use: [
						{
							loader: 'file-loader',
							options: {
								// name: '[name].[hash].[ext]',
								name: '[name].[ext]',
								outputPath: 'fonts/'
							}
						},
					]
				},
			],
		},

		plugins: pluginsArray,

		resolve: {
		    alias: {
		    	/*--------------------------------------------------------------- 
		    	 * // Instead of using relative paths when importing like so:
				 *		import Utility from '../../utilities/utility';
				 * // you can use the alias:
				 *		import Utility from 'Vendor/utility';
		    	---------------------------------------------------------------*/
		    	_components: path.resolve(__dirname, 'src/js/components/'),
		    	_vendor: path.resolve(__dirname, 'src/js/vendor/')
		    }
		},
	};

module.exports = config;
