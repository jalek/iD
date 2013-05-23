iD.ui.RawMembershipEditor = function(context, entity) {
    var list, disclosure;

    var rawMembershipEditor = function(selection) {
        function toggled(expanded) {
            if (expanded) {
                selection.node().parentNode.scrollTop += 200;
            }
        }

        disclosure = iD.ui.Disclosure()
            .title(t('inspector.all_relations'))
            .expanded(true)
            .on('toggled', toggled)
            .content(content);

        selection.call(disclosure);
    };

    rawMembershipEditor.change = function() {
        drawMemberships();
    };

    function content(wrap) {
        list = wrap.append('ul')
            .attr('class', 'member-list');

        drawMemberships();
    }

    function selectRelation(d) {
        context.enter(iD.modes.Select(context, [d.relation.id]));
    }

    function changeRole(d) {
        var role = d3.select(this).property('value');
        context.perform(
            iD.actions.ChangeMember(d.relation.id, _.extend({}, d.member, {role: role}), d.index),
            t('operations.change_role.annotation'));
    }

    function deleteMembership(d) {
        context.perform(
            iD.actions.DeleteMember(d.relation.id, d.index),
            t('operations.delete_member.annotation.' + context.geometry(d.member.id)));
    }

    function drawMemberships() {
        var memberships = [];

        context.graph().parentRelations(entity).forEach(function(relation) {
            relation.members.forEach(function(member, index) {
                if (member.id === entity.id) {
                    memberships.push({relation: relation, member: member, index: index});
                }
            })
        });

        disclosure.title(t('inspector.all_relations') + ' (' + memberships.length + ')');

        var li = list.selectAll('li')
            .data(memberships, function(d) { return iD.Entity.key(d.relation) + ',' + d.index; });

        var row = li.enter().append('li')
            .attr('class', 'member-row');

        var relation = row.append('a')
            .attr('href', '#')
            .attr('class', 'member-entity')
            .on('click', selectRelation);

        relation.append('span')
            .attr('class', 'member-entity-icon')
            .each(function(d) {
                return d3.select(this)
                    .call(iD.ui.PresetIcon(context.geometry(d.relation.id)));
            });

        relation.append('span')
            .attr('class', 'member-entity-name')
            .text(function(d) { return iD.util.localeName(d.relation); });

        relation.append('span')
            .attr('class', 'member-entity-type')
            .text(function(d) { return context.presets().match(d.relation, context.graph()).name(); });

        row.append('span')
            .attr('class', 'member-role')
            .append('input')
            .property('type', 'text')
            .attr('class', 'member-role-input')
            .attr('maxlength', 255)
            .attr('placeholder', t('inspector.role'))
            .property('value', function(d) { return d.member.role; })
            .on('change', changeRole);

        row.append('button')
            .attr('tabindex', -1)
            .attr('class', 'member-delete')
            .on('click', deleteMembership)
            .append('span')
            .attr('class', 'icon delete');

        li.exit()
            .remove();
    }

    return rawMembershipEditor;
};
