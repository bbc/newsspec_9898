define([
    'lib/news_special/bootstrap',
    'issues',
    'policies',
    'confirmation'
], function (news, IssuesView, PoliciesView, ConfirmationView) {

    function ViewManager() {
        this.issueView = new IssuesView();
        this.policiesView = new PoliciesView();
        this.confirmationView = new ConfirmationView();

        this.issuesPage = $('.page__issues');
        this.policiesPage = $('.page__policies');
        this.resultsPage = $('.page__results');

        /* LISTENERS */
        news.pubsub.on('policies:chosen', $.proxy(this.policiesChosen, this));
        news.pubsub.on('results:show', $.proxy(this.showResults, this));
        news.pubsub.on('reset', $.proxy(this.reset, this));
    }

    ViewManager.prototype = {

        policiesChosen: function (polcies) {
            this.policiesView.setPolicies(polcies);
            this.policiesView.showNextPolicy();

            this.issuesPage.hide();
            this.policiesPage.show();

            this.updateBreadcrumbs(1);
        },

        showResults: function (chosenPolicies) {
            this.issuesPage.hide();
            this.policiesPage.hide();

            this.updateBreadcrumbs(2);

            console.log(chosenPolicies);
            news.pubsub.emit('fetch:policy-cards', [chosenPolicies]);
        },

        updateBreadcrumbs: function (position) {
            var breadcrumbs = $('.breadcrumb');
            breadcrumbs.removeClass('breadcrumb__active');
            breadcrumbs.removeClass('breadcrumb__teal');


            breadcrumbs.each(function (index) {
                if (index < position) {
                    $(this).addClass('breadcrumb__teal');
                } else if (index === position) {
                    $(this).addClass('breadcrumb__active');
                }
            });

        },

        reset: function () {
            this.updateBreadcrumbs(0);

            this.policiesPage.hide();
            this.resultsPage.hide();
            this.issuesPage.show();
        }

    };

    return ViewManager;
});