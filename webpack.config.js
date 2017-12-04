const 	path = require('path'),
		webpack = require('webpack')

const	ExtractTextPlugin = require('extract-text-webpack-plugin'),
		HtmlWebpackPlugin = require('html-webpack-plugin'),
		CSSSplitWebpackPlugin = require('css-split-webpack-plugin').default,
		CopyWebpackPlugin = require('copy-webpack-plugin'),
		CleanWebpackPlugin = require('clean-webpack-plugin'),
		FaviconsWebpackPlugin = require('favicons-webpack-plugin'),
		ResourceHintWebpackPlugin = require('resource-hints-webpack-plugin'),
		ImageminPlugin = require('imagemin-webpack-plugin').default,
		imageminJpegRecompress = require('imagemin-jpeg-recompress'),
		WebpackBuildNotifierPlugin = require('webpack-build-notifier'),
		DashboardPlugin = require('webpack-dashboard/plugin')

const 	getBuildEnv = (process.env.NODE_ENV === 'development') ? true : false



/*-----------------------------------------------------------------------------*/ 
// Webpack Bundle Analyzer *** UNCOMMENT THIS SECTION
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
/*------------------------------------------------------------------------------*/ 
console.log("==========================================")
console.log("   Compling for: " + process.env.NODE_ENV.toUpperCase());
console.log("   Build time: " + new Date().toLocaleTimeString());
console.log("==========================================")

/*------------------------------------------------------------------------------------------- 
 * PLUGIN
 *-----------------------------------------------------------------------------------------*/
	const pluginsArray = [

		//- Webpack Build Notifier
		//-----------------------------------------------------------------------
			new WebpackBuildNotifierPlugin({
		      title: "Webpack Build",
		      logo: path.resolve("./img/favicon.png"),
		      suppressSuccess: true
		    }),

		//- Webpack Dashboard
		//-----------------------------------------------------------------------
			new DashboardPlugin(),

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

		//- Split CSS bundle when file exceeds x(def. 4000) number of selectors
		//-----------------------------------------------------------------------
			new CSSSplitWebpackPlugin({
				size: 3500
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
					jpegtran: null,
					gifsicle: {
						interlaced: false,
					},
					pngquant: {
						quality: '70-75',
						speed: 7,
					},
					optipng: {
						optimizationLevel: 2,
					},
					svgo: {
						removeViewBox: false,
						removeEmptyAttrs: true,
					},
				plugins: [
					imageminJpegRecompress({
						quality: 'low'
					})
				]
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
	module.exports = {
		entry: {
			index: './src/js/bundle-index.js',
		},

		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: 'js/bundle-[name].js',
		},

		devServer: {
			historyApiFallback: true,
			inline: true,
			progress: true,
			contentBase: './src',
			compress: true,
			host: '0.0.0.0',
			port: 3000,
			disableHostCheck: true
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
									sourceMap: getBuildEnv,
									minimize: true,
								}
							},
				            { loader: 'postcss-loader', options: { sourceMap: getBuildEnv, }},
				            { loader: 'sass-loader', options: { sourceMap: getBuildEnv,}},
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
						options: { presets: ['env'] },
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
