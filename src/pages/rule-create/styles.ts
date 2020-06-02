import { makeStyles } from '@material-ui/core/styles';
import { EXTRA_COLORS } from '../../theme';

export const useStyles = makeStyles(
    (theme) => ({
        container: {
            display: 'flex',
            marginTop: 40,
            flexWrap: 'wrap'
        },
        sectionSearch: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        },
        sections: {
            marginLeft: 16,
            marginRight: 16,
            marginTop: 16,
            minWidth: 340
        },
        elementItem: {
            padding: 16,
            marginBottom: 8
        },
        captionText: {
            color: EXTRA_COLORS.subTitle
        },
        errorText: {
            color: theme.palette.error.dark
        },
        successText: {
            color: theme.palette.success.dark
        },
        submitButton: {
            marginBottom: 8
        },
        successButtons: {
            display: 'flex',
            justifyContent: 'flex-end'
        },
        visitButton: {
            color: theme.palette.warning.dark
        },
        moreButton: {
            color: theme.palette.info.dark
        }
    })
);

 export default useStyles;