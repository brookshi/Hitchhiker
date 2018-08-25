work_path=$(dirname $(readlink -f $0))
ln -sf "${work_path}..\..\..\api\src\common" "${work_path}..\common" 
