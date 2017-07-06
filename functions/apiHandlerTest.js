//Any requires you have should go here.
//These are all hard-coded methods....
class InfermedicaApi {
    static parseText (text) {
        return [
            {
                id: 's_1193',
                choice_id: 'present'
            },
            {
                id: 's_488',
                choice_id: 'present'
            },
            {
                id: 's_418',
                choice_id: 'present'
            }
        ];
    }
};
module.exports = InfermedicaApi;