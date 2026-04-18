import { expect } from 'chai';
import sinon from 'sinon';
import { switchBack, backMenuFunc } from '@backend/app/backMenu';
import type { MenuData } from '@backend/types/types';

describe('backMenu', () => {
    let adapterMock: any;

    const menuData: MenuData = {
        menu1: {
            page1: {
                text: 'Page 1 Text',
                nav: [['btn1', 'btn2']],
                parse_mode: false,
            },
            page2: {
                text: 'Page 2 Text',
                nav: [['btn3', 'btn4']],
                parse_mode: true,
            },
        },
    };

    beforeEach(() => {
        adapterMock = {
            log: {
                debug: sinon.stub(),
                warn: sinon.stub(),
                error: sinon.stub(),
            },
            getForeignStateAsync: sinon.stub(),
            getForeignObjectAsync: sinon.stub(),
        };
    });

    describe('backMenuFunc', () => {
        it('should initialize backMenu for new user', () => {
            backMenuFunc({ activePage: 'page1', userToSend: 'userA' });
            // No error thrown, backMenu initialized
        });

        it('should add last page to list when navigating', () => {
            backMenuFunc({ activePage: 'page1', userToSend: 'userB' });
            backMenuFunc({ activePage: 'page2', userToSend: 'userB' });
            // second call should push page1 into the list
        });

        it('should not add to backMenu when navigation contains menu:', () => {
            const navigation = [['menu:test']];
            backMenuFunc({ activePage: 'page1', navigation, userToSend: 'userC' });
            // navigation contains menu: so backMenu should not be updated
        });

        it('should add to backMenu when navigation does not contain menu:', () => {
            const navigation = [['btn1', 'btn2']];
            backMenuFunc({ activePage: 'page1', navigation, userToSend: 'userD' });
        });
    });

    describe('switchBack', () => {
        it('should return undefined if backMenu list is empty', async () => {
            const result = await switchBack(adapterMock, 'unknownUser', menuData, ['menu1']);
            expect(result).to.be.undefined;
        });

        it('should return correct keyboard and text when going back', async () => {
            const user = 'userE';
            // Navigate forward: page1 -> page2
            backMenuFunc({ activePage: 'page1', userToSend: user });
            backMenuFunc({ activePage: 'page2', userToSend: user });

            const result = await switchBack(adapterMock, user, menuData, ['menu1']);

            expect(result).to.not.be.undefined;
            expect(result?.keyboard).to.deep.equal([['btn1', 'btn2']]);
            expect(result?.textToSend).to.equal('Page 1 Text');
        });

        it('should return correct keyboard and text when going back to last menu', async () => {
            const user = 'userF';
            backMenuFunc({ activePage: 'page1', userToSend: user });
            backMenuFunc({ activePage: 'page2', userToSend: user });

            const result = await switchBack(adapterMock, user, menuData, ['menu1'], true);

            expect(result).to.not.be.undefined;
            expect(result?.keyboard).to.deep.equal([['btn3', 'btn4']]);
        });

        it('should return undefined if no matching menu is found', async () => {
            const user = 'userG';
            backMenuFunc({ activePage: 'page1', userToSend: user });
            backMenuFunc({ activePage: 'page2', userToSend: user });

            const result = await switchBack(adapterMock, user, menuData, ['nonExistentMenu']);
            expect(result).to.be.undefined;
        });
    });
});
