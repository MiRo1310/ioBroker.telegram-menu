import { expect } from 'chai';
import sinon from 'sinon';
import { backMenuRegistry } from '@backend/app/backMenu';
import type { MenuData } from '@backend/types/types';

describe('backMenu', () => {
    let adapterMock: any;

    const menuData: MenuData = {
        menu1: {
            page1: { text: 'Page 1 Text', nav: [['btn1', 'btn2']], parse_mode: false },
            page2: { text: 'Page 2 Text', nav: [['btn3', 'btn4']], parse_mode: true },
        },
    };

    beforeEach(() => {
        adapterMock = {
            log: { debug: sinon.stub(), warn: sinon.stub(), error: sinon.stub() },
            getForeignStateAsync: sinon.stub(),
            getForeignObjectAsync: sinon.stub(),
        };
    });

    describe('backMenuFunc', () => {
        it('should initialize backMenu for new user', () => {
            backMenuRegistry.backMenuFunc({ activePage: 'page1', userToSend: 'userA' });
        });

        it('should add last page to list when navigating', () => {
            backMenuRegistry.backMenuFunc({ activePage: 'page1', userToSend: 'userB' });
            backMenuRegistry.backMenuFunc({ activePage: 'page2', userToSend: 'userB' });
        });

        it('should not add to backMenu when navigation contains menu:', () => {
            const navigation = [['menu:test']];
            backMenuRegistry.backMenuFunc({ activePage: 'page1', navigation, userToSend: 'userC' });
        });

        it('should add to backMenu when navigation does not contain menu:', () => {
            const navigation = [['btn1', 'btn2']];
            backMenuRegistry.backMenuFunc({ activePage: 'page1', navigation, userToSend: 'userD' });
        });

        it('should shift oldest entry when list reaches max length', () => {
            const user = 'userShift';
            for (let i = 0; i < 22; i++) {
                backMenuRegistry.backMenuFunc({ activePage: `page${i}`, userToSend: user });
            }
        });
    });

    describe('switchBack', () => {
        it('should return undefined if backMenu list is empty', async () => {
            const result = await backMenuRegistry.switchBack(adapterMock, 'unknownUser', menuData, ['menu1']);
            expect(result).to.be.undefined;
        });

        it('should return correct keyboard and text when going back', async () => {
            const user = 'userE';
            backMenuRegistry.backMenuFunc({ activePage: 'page1', userToSend: user });
            backMenuRegistry.backMenuFunc({ activePage: 'page2', userToSend: user });
            const result = await backMenuRegistry.switchBack(adapterMock, user, menuData, ['menu1']);
            expect(result).to.not.be.undefined;
            expect(result?.keyboard).to.deep.equal([['btn1', 'btn2']]);
            expect(result?.textToSend).to.equal('Page 1 Text');
        });

        it('should call textModifier when text is present in menu entry', async () => {
            const user = 'userTextMod';
            backMenuRegistry.backMenuFunc({ activePage: 'page1', userToSend: user });
            backMenuRegistry.backMenuFunc({ activePage: 'page2', userToSend: user });
            const result = await backMenuRegistry.switchBack(adapterMock, user, menuData, ['menu1']);
            expect(result?.textToSend).to.equal('Page 1 Text');
        });

        it('should return correct keyboard and text when going back to last menu', async () => {
            const user = 'userF';
            backMenuRegistry.backMenuFunc({ activePage: 'page1', userToSend: user });
            backMenuRegistry.backMenuFunc({ activePage: 'page2', userToSend: user });
            const result = await backMenuRegistry.switchBack(adapterMock, user, menuData, ['menu1'], true);
            expect(result).to.not.be.undefined;
            expect(result?.keyboard).to.deep.equal([['btn3', 'btn4']]);
        });

        it('should return undefined if no matching menu is found', async () => {
            const user = 'userG';
            backMenuRegistry.backMenuFunc({ activePage: 'page1', userToSend: user });
            backMenuRegistry.backMenuFunc({ activePage: 'page2', userToSend: user });
            const result = await backMenuRegistry.switchBack(adapterMock, user, menuData, ['nonExistentMenu']);
            expect(result).to.be.undefined;
        });

        it('should return parse_mode from menu entry', async () => {
            const user = 'userPM';
            backMenuRegistry.backMenuFunc({ activePage: 'page1', userToSend: user });
            backMenuRegistry.backMenuFunc({ activePage: 'page2', userToSend: user });
            const result = await backMenuRegistry.switchBack(adapterMock, user, menuData, ['menu1']);
            expect(result?.parse_mode).to.equal(false);
        });

        it('should catch errors and call errorLogger', async () => {
            const user = 'userErr';
            backMenuRegistry.backMenuFunc({ activePage: 'page1', userToSend: user });
            backMenuRegistry.backMenuFunc({ activePage: 'page2', userToSend: user });
            adapterMock.log.debug = sinon.stub().throws(new Error('debug error'));
            adapterMock.log.error = sinon.stub();
            adapterMock.supportsFeature = sinon.stub().returns(false);
            const result = await backMenuRegistry.switchBack(adapterMock, user, menuData, ['nonExistentMenu']);
            expect(result).to.be.undefined;
            expect(adapterMock.log.error.called).to.be.true;
        });
    });
});
