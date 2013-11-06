"use strict";

describe('dir', function () {
    
    var fse = require('fs-extra');
    var pathUtil = require('path');
    var utils = require('./specUtils');
    var jetpack = require('..');
    
    beforeEach(utils.beforeEach);
    afterEach(utils.afterEach);
    
    describe('sync', function () {
        
        it('should make sure dir exist', function () {
            expect(fse.existsSync('something')).toBe(false);
            jetpack.dir('something');
            expect(fse.existsSync('something')).toBe(true);
        });
        
        it('should make sure many nested dirs exist', function () {
            expect(fse.existsSync('something')).toBe(false);
            jetpack.dir('something/other');
            expect(fse.existsSync('something')).toBe(true);
            expect(fse.existsSync('something/other')).toBe(true);
        });
        
        it('should make sure dir does not exist', function () {
            fse.mkdirSync('something');
            expect(fse.existsSync('something')).toBe(true);
            jetpack.dir('something', { exists: false });
            expect(fse.existsSync('something')).toBe(false);
        });
        
        it('should not bother about dir emptiness if not said so', function () {
            fse.mkdirsSync('something/other');
            expect(fse.existsSync('something/other')).toBe(true);
            jetpack.dir('something');
            expect(fse.existsSync('something/other')).toBe(true);
        });
        
        it('should make sure dir is empty', function () {
            fse.mkdirsSync('something/other');
            expect(fse.existsSync('something/other')).toBe(true);
            jetpack.dir('something', { empty: true });
            expect(fse.existsSync('something/other')).toBe(false);
        });
        
        it('if exists = false, empty should be ignored', function () {
            fse.mkdirsSync('something/other');
            expect(fse.existsSync('something/other')).toBe(true);
            jetpack.dir('something', { exists: false, empty: true });
            expect(fse.existsSync('something')).toBe(false);
        });
        
        it('if exists = false, returned CWD context should refer to parent of given directory', function () {
            var context = jetpack.dir('something', { exists: false });
            expect(context.cwd()).toBe(process.cwd());
        });
        
        it('if given path is file, should delete it and place dir instead', function () {
            fse.createFileSync('something');
            expect(fse.statSync('something').isFile()).toBe(true);
            jetpack.dir('something');
            expect(fse.statSync('something').isDirectory()).toBe(true);
        });
        
        it('can chain dir calls, and should return new CWD context', function () {
            var context = jetpack.dir('something');
            expect(context.cwd()).toBe(pathUtil.resolve(process.cwd(), 'something'));
            context = context.dir('else');
            expect(context.cwd()).toBe(pathUtil.resolve(process.cwd(), 'something/else'));
            expect(fse.existsSync('something/else')).toBe(true);
        });
        
        if (process.platform === 'win32') {
        
            describe('windows specyfic', function () {
                
                
                
            });
                
        } else {
            
            describe('*nix specyfic', function () {
                
                // tests assume umask is not greater than 022
                
                it('should set mode to created directory', function () {
                    expect(fse.existsSync('something')).toBe(false);
                    jetpack.dir('something', { mode: '521' }); // mode as string
                    expect(fse.statSync('something').mode.toString(8)).toBe('40521');
                    expect(fse.existsSync('other')).toBe(false);
                    jetpack.dir('other', { mode: parseInt('521', 8) }); // mode as number
                    expect(fse.statSync('other').mode.toString(8)).toBe('40521');
                });
                
                it('should set that mode to every created directory', function () {
                    expect(fse.existsSync('something')).toBe(false);
                    jetpack.dir('something/other', { mode: '721' });
                    expect(fse.statSync('something').mode.toString(8)).toBe('40721');
                    expect(fse.statSync('something/other').mode.toString(8)).toBe('40721');
                });
                
                it('should change mode of existing directory if not match', function () {
                    fse.mkdirSync('something', '777');
                    expect(fse.existsSync('something')).toBe(true);
                    jetpack.dir('something', { mode: '521' });
                    expect(fse.statSync('something').mode.toString(8)).toBe('40521');
                });
                
                it('should leave mode of directory intact if not specified', function () {
                    fse.mkdirSync('something', '700');
                    jetpack.dir('something');
                    expect(fse.statSync('something').mode.toString(8)).toBe('40700');
                });
                
            });
            
        }
        
    });
    
    describe('async', function () {
        
        it('should make sure dir exist', function () {
            var done = false;
            expect(fse.existsSync('something')).toBe(false);
            jetpack.dirAsync('something')
            .then(function () {
                expect(fse.existsSync('something')).toBe(true);
                done = true;
            });
            waitsFor(function () { return done; }, null, 200);
        });
        
        it('should make sure many nested dirs exist', function () {
            var done = false;
            expect(fse.existsSync('something')).toBe(false);
            jetpack.dirAsync('something/other')
            .then(function () {
                expect(fse.existsSync('something')).toBe(true);
                expect(fse.existsSync('something/other')).toBe(true);
                done = true;
            });
            waitsFor(function () { return done; }, null, 200);
        });
        
        it('should make sure dir does not exist', function () {
            var done = false;
            expect(fse.existsSync('something')).toBe(false);
            // dir does not exist
            jetpack.dirAsync('something', { exists: false })
            .then(function () {
                fse.mkdirSync('something');
                expect(fse.existsSync('something')).toBe(true);
                // dir exist
                return jetpack.dirAsync('something', { exists: false });
            })
            .then(function () {
                expect(fse.existsSync('something')).toBe(false);
                done = true;
            });
            waitsFor(function () { return done; }, null, 200);
        });
        
        it('should not bother about dir emptiness if not said so', function () {
            var done = false;
            fse.mkdirsSync('something/other');
            expect(fse.existsSync('something/other')).toBe(true);
            jetpack.dirAsync('something')
            .then(function () {
                expect(fse.existsSync('something/other')).toBe(true);
                done = true;
            });
            waitsFor(function () { return done; }, null, 200);
        });
        
        it('should make sure dir is empty', function () {
            var done = false;
            fse.mkdirsSync('something/other');
            expect(fse.existsSync('something/other')).toBe(true);
            jetpack.dirAsync('something', { empty: true })
            .then(function () {
                expect(fse.existsSync('something/other')).toBe(false);
                done = true;
            });
            waitsFor(function () { return done; }, null, 200);
        });
        
        it('if exists = false, empty should be ignored', function () {
            var done = false;
            fse.mkdirsSync('something/other');
            expect(fse.existsSync('something/other')).toBe(true);
            jetpack.dirAsync('something', { exists: false, empty: true })
            .then(function () {
                expect(fse.existsSync('something')).toBe(false);
                done = true;
            });
            waitsFor(function () { return done; }, null, 200);
        });
        
        it('if exists = false, returned CWD context should refer to parent of given directory', function () {
            var done = false;
            jetpack.dirAsync('something', { exists: false })
            .then(function (context) {
                expect(context.cwd()).toBe(process.cwd());
                done = true;
            });
            waitsFor(function () { return done; }, null, 200);
        });
        
        it('if given path is file, should delete it and place dir instead', function () {
            var done = false;
            fse.createFileSync('something');
            expect(fse.statSync('something').isFile()).toBe(true);
            jetpack.dirAsync('something')
            .then(function () {
                expect(fse.statSync('something').isDirectory()).toBe(true);
                done = true;
            });
            waitsFor(function () { return done; }, null, 200);
        });
        
        it('can chain dir calls, and should return new CWD context', function () {
            var done = false;
            jetpack.dirAsync('something')
            .then(function (context) {
                expect(context.cwd()).toBe(pathUtil.resolve(process.cwd(), 'something'));
                return context.dirAsync('else');
            })
            .then(function (context) {
                expect(context.cwd()).toBe(pathUtil.resolve(process.cwd(), 'something/else'));
                expect(fse.existsSync('something/else')).toBe(true);
                done = true;
            });
            waitsFor(function () { return done; }, null, 200);
        });
        
        if (process.platform === 'win32') {
        
            describe('windows specyfic', function () {
                
                
                
            });
                
        } else {
            
            describe('*nix specyfic', function () {
                
                // tests assume umask is not greater than 022
                
                it('should set mode to created directory', function () {
                    var done = false;
                    expect(fse.existsSync('something')).toBe(false);
                    expect(fse.existsSync('something')).toBe(false);
                    jetpack.dirAsync('something', { mode: '521' }) //mode as string
                    .then(function () {
                        return jetpack.dirAsync('other', { mode: parseInt('521', 8) }) //mode as number
                    })
                    .then(function () {
                        expect(fse.statSync('something').mode.toString(8)).toBe('40521');
                        expect(fse.statSync('other').mode.toString(8)).toBe('40521');
                        done = true;
                    });
                    waitsFor(function () { return done; }, null, 200);
                });
                
                it('should set that mode to every created directory (mode as number)', function () {
                    var done = false;
                    expect(fse.existsSync('something')).toBe(false);
                    jetpack.dirAsync('something/other', { mode: '721' })
                    .then(function () {
                        expect(fse.statSync('something').mode.toString(8)).toBe('40721');
                        expect(fse.statSync('something/other').mode.toString(8)).toBe('40721');
                        done = true;
                    });
                    waitsFor(function () { return done; }, null, 200);
                });
                
                it('should change mode of existing directory if not match', function () {
                    var done = false;
                    fse.mkdirSync('something', '777');
                    expect(fse.existsSync('something')).toBe(true);
                    jetpack.dirAsync('something', { mode: '521' })
                    .then(function () {
                        expect(fse.statSync('something').mode.toString(8)).toBe('40521');
                        done = true;
                    });
                    waitsFor(function () { return done; }, null, 200);
                });
                
                it('should leave mode of directory intact if not specified', function () {
                    var done = false;
                    fse.mkdirSync('something', '700');
                    jetpack.dirAsync('something')
                    .then(function () {
                        expect(fse.statSync('something').mode.toString(8)).toBe('40700');
                        done = true;
                    });
                    waitsFor(function () { return done; }, null, 200);
                });
                
            });
            
        }
        
    });
    
});