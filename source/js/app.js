define([
    'lib/news_special/bootstrap',
    'viewManager',
    'nation-filter',
    'collection-view',
    'card-model',
    'lib/news_special/share_tools/controller',
    'lib/vendors/fastclick'
], function (news, ViewManager, NationFilter, CollectionView, CardModel, ShareTools, FastClick) {

    FastClick.attach(document.body);

    var filterBy = {
            'issue': 'party',
            'party': 'issue'
        },
        slotSelect = {
            'issue': ['con', 'lab', 'ld', 'ukip', 'grn', 'res', 'pc', 'ap', 'dup', 'sdlp', 'sf', 'tuv', 'uup', 'snp'],
            'party': ['priorities', 'benefits', 'constitution', 'economy', 'europe', 'education', 'environment', 'foreign', 'health', 'housing', 'immigration', 'employment', 'justice', 'local', 'pensions', 'rural', 'taxation', 'transport']
        },
        regionalOrNationalPartyInWestminster = {
            'all': ['uk', 'eng', 'ni', 'scot', 'cym'],
            'con': ['uk', 'eng', 'scot', 'cym'],
            'lab': ['uk', 'eng', 'scot', 'cym'],
            'ld': ['uk', 'eng', 'scot', 'cym'],
            'ukip': ['uk', 'eng', 'ni', 'scot', 'cym'],
            'grn': ['uk', 'eng', 'ni', 'scot', 'cym'],
            'res': ['uk', 'eng'],
            'dup': ['uk', 'ni'],
            'snp': ['uk', 'scot'],
            'sf': ['uk', 'ni'],
            'pc': ['uk', 'cym'],
            'ap': ['uk', 'ni'],
            'sdlp': ['uk', 'ni'],
            'tuv': ['ni'],
            'uup': ['ni']
        },
        regionalPartiesWhoNeedToShowInWestinsterView = [
            'res',
            'dup',
            'snp',
            'sf',
            'pc',
            'ap',
            'sdlp'
        ],
        devolvedIssuesByIssue = {
            'priorities': ['uk'],
            'benefits': ['uk', 'ni'],
            'constitution': ['uk'],
            'economy': ['uk', 'ni'],
            'education': ['uk', 'eng', 'ni', 'scot', 'cym'],
            'environment': ['uk', 'eng', 'ni', 'scot', 'cym'],
            'foreign': ['uk'],
            'health': ['uk', 'eng', 'ni', 'scot', 'cym'],
            'housing': ['uk', 'eng', 'ni', 'scot', 'cym'],
            'immigration': ['uk'],
            'employment': ['uk'],
            'justice': ['uk', 'ni', 'scot'],
            'local': ['uk', 'eng', 'ni', 'scot', 'cym'],
            'pensions': ['uk', 'ni'],
            'rural': ['uk', 'eng', 'ni', 'scot', 'cym'],
            'taxation': ['uk'],
            'transport': ['uk', 'eng', 'ni', 'scot', 'cym']
        },
        devolvedMessage = {
            'benefits': ['ni'],
            'economy': ['ni'],
            'education': ['ni', 'scot', 'cym'],
            'environment': ['ni', 'scot', 'cym'],
            'health': ['ni', 'scot', 'cym'],
            'housing': ['ni', 'scot', 'cym'],
            'justice': ['ni', 'scot'],
            'local': ['ni', 'scot', 'cym'],
            'pensions': ['ni'],
            'rural': ['ni', 'scot', 'cym'],
            'transport': ['ni', 'scot', 'cym']
        },
        partyDefaultNation = {
            'all': 'uk',
            'con': 'uk',
            'lab': 'uk',
            'ld': 'uk',
            'ukip': 'uk',
            'grn': 'uk',
            'res': 'uk',
            'dup': 'ni',
            'snp': 'scot',
            'sf': 'ni',
            'pc': 'cym',
            'ap': 'ni',
            'sdlp': 'ni',
            'tuv': 'ni',
            'uup': 'ni'
        },
        nations = ['eng', 'ni', 'scot', 'cym'],
        partyNames = {
            'con': 'Conservative',
            'lab': 'Labour',
            'ld': 'Liberal Democrats',
            'ukip': 'UKIP',
            'grn': 'Green',
            'res': 'Respect',
            'dup': 'Democratic Unionist Party',
            'snp': 'SNP',
            'sf': 'Sinn Fein',
            'pc': 'Plaid Cymru',
            'ap': 'Alliance Party',
            'tuv': 'Traditional Unionist Voice',
            'uup': 'Ulster Unionist Party',
            'sdlp': 'SDLP'
        };


    function listenForComponentStateChanges() {
        news.pubsub.on('nation:filter:change', function (data) {
            news.pubsub.emit('collection:view:apply:filter', [data]);
        });
        news.pubsub.on('collection:view:resize', function (data) {
            requestNewCollectionViewBasedOnState(data);
        });
        news.pubsub.on('collection:view:show-policy', function (data) {
            requestNewCollectionViewBasedOnState(data);
        });
    }

    function requestNewCollectionViewBasedOnState(policy) {
        news.pubsub.emit('collection:view:update:issue', [{
            'type': 'issues',
            'selection': policy,
            'filter': 'uk'
        }]);
    }


    function addNationFilterToApplication() {
        new NationFilter({
            'state': 'uk'
        });
    }

    function addCollectionViewToApplication(options) {
        new CardModel(options.pathdomain, options.pathpal);
        new CollectionView({
            'endpoint': '/indepthtoolkit/issues-guide/issues',
            'elem': 'issue',
            'filterBy': filterBy,
            'slotSelect': slotSelect,
            'regionalOrNationalPartyInWestminster': regionalOrNationalPartyInWestminster,
            'partyDefaultNation': partyDefaultNation,
            'regionalPartiesWhoNeedToShowInWestinsterView': regionalPartiesWhoNeedToShowInWestinsterView,
            'nations': nations
        });
    }

    function recoverFromSharedState() {
        var stateHash = window.location.hash;
        if (stateHash) {
            var safeHash = makeStateSafe(stateHash),
                policyCards = safeHash.split('!');
            if (policyCards.length > 0) {
                news.pubsub.emit('results:load-from:share', [policyCards]);
            }
        }
    }

    function makeStateSafe(stateCode) {
        /* Removes all characters that aren't a-z, ! or - */
        /* This should prevent attacks. */
        return stateCode.replace(/([^a-z\-!])/gi, '');
    }

    function init(options) {
        addNationFilterToApplication();
        addCollectionViewToApplication(options);
        listenForComponentStateChanges();

        new ViewManager({partyNames: partyNames});

        news.sendMessageToremoveLoadingImage();
        $('.main').show();

        recoverFromSharedState();
    }

    return {
        init: init
    };

});